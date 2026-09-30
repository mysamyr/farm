import { type ReactElement, useCallback, useMemo, useState } from 'react';

import { Button } from '@game/client-core/components';
import { ButtonVariant } from '@game/client-core/constants';
import { useSnackbar } from '@game/client-core/hooks';
import { emitGameEvent } from '@game/client-core/socket';

import { EVENTS, ROOM_STATES } from '@game/shared/constants';

import {
  BASE_SKILLS,
  REQUIRED_ACTIVE_COUNT,
  REQUIRED_HEALING_COUNT,
  REQUIRED_PASSIVE_COUNT,
  SKILLS,
  type ActiveSkill,
  type HealingSkill,
  type PassiveSkill,
  type Player,
  type Room,
  type Skill,
  type SkillId,
  SkillType,
} from '@game/game-arena/shared';

import PlayerStatsDisplay from '../../components/PlayerStats.js';
import SkillCard from '../../components/SkillCard.js';
import SkillDetailSheet from '../../components/SkillDetailSheet.js';
import SpectatorSkills from '../../components/SpectatorSkills.js';
import { getSkillIcon, getSkillName } from '../../constants/index.js';
import { useArenaTranslation } from '../../hooks/useArenaTranslation.js';
import { getCurrentPlayer, getPreviewPlayer } from '../../utils/index.js';

import styles from './Preparation.module.css';

type PreparationProps = {
  room: Room;
};

function SpectatorPreparation({ room }: PreparationProps): ReactElement {
  const t = useArenaTranslation();

  const playersInTurnOrder = room.order
    .map(id => room.players.find(player => player.id === id))
    .filter((player): player is Player => Boolean(player));

  return (
    <div className={styles.spectatorLayout}>
      <main className={styles.spectatorMain}>
        <div className={styles.spectatorIntro}>
          <h2 className={styles.spectatorTitle}>
            {t.preparation.spectatorTitle}
          </h2>
          <p>{t.preparation.spectatorDescription}</p>
          <p className={styles.readySummary}>
            {t.preparation.waitingForPlayers
              .replace(
                '{ready}',
                String(room.players.filter(player => player.ready).length)
              )
              .replace('{total}', String(room.players.length))}
          </p>
        </div>
        <div className={styles.spectatorPlayers}>
          {playersInTurnOrder.map((player, index) => (
            <section key={player.id} className={styles.spectatorPlayer}>
              <div className={styles.spectatorStatus}>
                {player.ready
                  ? t.preparation.readyStatus
                  : t.preparation.selectingStatus}
              </div>
              <PlayerStatsDisplay
                player={player}
                turnOrder={index + 1}
                isActive={false}
                isEliminated={false}
                isMatchEnded={false}
              />
              {player.ready && <SpectatorSkills player={player} />}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

function PreparationPlayer({ room }: PreparationProps): ReactElement {
  const { showSnackbar } = useSnackbar();
  const t = useArenaTranslation();

  const [selectedActives, setSelectedActives] = useState<SkillId[]>([]);
  const [selectedHealing, setSelectedHealing] = useState<SkillId[]>([]);
  const [selectedPassives, setSelectedPassives] = useState<SkillId[]>([]);
  const [detailSkill, setDetailSkill] = useState<Skill | null>(null);

  const isGameOver =
    !!room && (room.state === ROOM_STATES.FINISHED || Boolean(room.winner));
  const currentPlayer = room ? getCurrentPlayer(room) : null;
  const isLocked = isGameOver || Boolean(currentPlayer?.ready);

  const { activeSkills, healingSkills, passiveSkills } = useMemo(() => {
    const baseSkillIds = new Set(BASE_SKILLS);
    return {
      activeSkills: Object.values(SKILLS).filter(
        s => s.type === SkillType.active && !baseSkillIds.has(s.id)
      ) as ActiveSkill[],
      healingSkills: Object.values(SKILLS).filter(
        s => s.type === SkillType.healing
      ),
      passiveSkills: Object.values(SKILLS).filter(
        s => s.type === SkillType.passive
      ),
    };
  }, []);

  const handleSelectActive = useCallback(
    (skillId: SkillId) => {
      if (isLocked) return;
      setSelectedActives(prev => {
        if (prev.includes(skillId)) return prev.filter(id => id !== skillId);
        if (prev.length >= REQUIRED_ACTIVE_COUNT) {
          if (window.matchMedia('(pointer: coarse)').matches)
            showSnackbar(t.preparation.activeSkillsFull);
          return prev;
        }
        return [...prev, skillId];
      });
    },
    [isLocked, showSnackbar, t.preparation.activeSkillsFull]
  );

  const handleSelectPassive = useCallback(
    (skillId: SkillId) => {
      if (isLocked) return;
      setSelectedPassives(prev => {
        if (prev.includes(skillId)) return prev.filter(id => id !== skillId);
        if (prev.length >= REQUIRED_PASSIVE_COUNT) {
          if (window.matchMedia('(pointer: coarse)').matches)
            showSnackbar(t.preparation.passiveSkillsFull);
          return prev;
        }
        return [...prev, skillId];
      });
    },
    [isLocked, showSnackbar, t.preparation.passiveSkillsFull]
  );

  const handleSelectHealing = useCallback(
    (skillId: SkillId) => {
      if (isLocked) return;
      setSelectedHealing(prev => {
        if (prev.includes(skillId)) return prev.filter(id => id !== skillId);
        if (prev.length >= REQUIRED_HEALING_COUNT) {
          if (window.matchMedia('(pointer: coarse)').matches)
            showSnackbar(t.preparation.healingSkillFull);
          return prev;
        }
        return [...prev, skillId];
      });
    },
    [isLocked, showSnackbar, t.preparation.healingSkillFull]
  );

  const isSelectionComplete =
    selectedActives.length === REQUIRED_ACTIVE_COUNT &&
    selectedHealing.length === REQUIRED_HEALING_COUNT &&
    selectedPassives.length === REQUIRED_PASSIVE_COUNT;

  const handleReset = useCallback(() => {
    if (!room || isGameOver) return;
    if (isLocked) {
      emitGameEvent(
        EVENTS.GAME_ACTION,
        { roomId: room.id, action: { type: 'PLAYER_UPDATE', ready: false } },
        (res: { ok: boolean }) => {
          if (!res.ok) {
            showSnackbar(t.preparation.failedToReady);
          }
        }
      );
      return;
    }
    setSelectedActives([]);
    setSelectedHealing([]);
    setSelectedPassives([]);
  }, [room, isGameOver, isLocked, showSnackbar, t.preparation.failedToReady]);

  const handleReady = useCallback(() => {
    if (!room || isGameOver || !isSelectionComplete || isLocked) return;
    const skills = [
      ...selectedActives,
      ...selectedHealing,
      ...selectedPassives,
    ];
    emitGameEvent(
      EVENTS.GAME_ACTION,
      {
        roomId: room.id,
        action: { type: 'PLAYER_UPDATE', ready: true, skills },
      },
      (res: { ok: boolean }) => {
        if (!res.ok) {
          showSnackbar(t.preparation.failedToReady);
        }
      }
    );
  }, [
    room,
    isGameOver,
    isSelectionComplete,
    isLocked,
    selectedActives,
    selectedHealing,
    selectedPassives,
    showSnackbar,
    t.preparation.failedToReady,
  ]);

  const previewPlayer: Player | null = (() => {
    if (!currentPlayer) return null;
    const skillIds = [
      ...selectedActives,
      ...selectedHealing,
      ...selectedPassives,
    ];
    return getPreviewPlayer(currentPlayer, skillIds);
  })();

  const activeSlotsFull = selectedActives.length >= REQUIRED_ACTIVE_COUNT;
  const healingSlotsFull = selectedHealing.length >= REQUIRED_HEALING_COUNT;
  const passiveSlotsFull = selectedPassives.length >= REQUIRED_PASSIVE_COUNT;

  return (
    <div className={styles.container}>
      <div className={styles.equippedSection}>
        {previewPlayer && (
          <div className={styles.statsPreview}>
            <PlayerStatsDisplay
              player={previewPlayer}
              turnOrder={room.order.indexOf(previewPlayer.id) + 1}
              isActive={false}
            />
          </div>
        )}

        <div className={styles.slotGroups}>
          <div className={styles.slotGroup}>
            <div className={styles.slotGroupHeader}>
              <span className={styles.slotGroupLabel}>
                {t.preparation.activeSkillsLabel}
              </span>
              <span className={styles.slotCounter}>
                {selectedActives.length}/{REQUIRED_ACTIVE_COUNT}
              </span>
            </div>
            <div className={styles.activeSlots}>
              {Array.from({ length: REQUIRED_ACTIVE_COUNT }).map((_, i) => {
                const skillId = selectedActives[i];
                return (
                  <div
                    key={`active-${i}`}
                    className={`${styles.slot} ${styles.equippedSlot} ${styles.activeSlot} ${skillId ? styles.slotFilled : ''} ${isLocked ? styles.slotLocked : ''}`}
                    onClick={() => {
                      if (isLocked || !skillId) return;
                      setSelectedActives(prev =>
                        prev.filter((_, idx) => idx !== i)
                      );
                    }}
                  >
                    {skillId ? (
                      <>
                        <span className={styles.slotIcon}>
                          {getSkillIcon(skillId)}
                        </span>
                        <span className={styles.slotName}>
                          {getSkillName(skillId, t.skillNames)}
                        </span>
                        {!isLocked && (
                          <span className={styles.slotRemove}>×</span>
                        )}
                      </>
                    ) : (
                      <span className={styles.slotPlus}>+</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.slotGroup}>
            <div className={styles.slotGroupHeader}>
              <span className={styles.slotGroupLabel}>
                {t.preparation.healingSkillsLabel}
              </span>
              <span className={styles.slotCounter}>
                {selectedHealing.length}/{REQUIRED_HEALING_COUNT}
              </span>
            </div>
            <div className={styles.healingSlots}>
              {Array.from({ length: REQUIRED_HEALING_COUNT }).map((_, i) => {
                const skillId = selectedHealing[i];
                return (
                  <div
                    key={`healing-${i}`}
                    className={`${styles.slot} ${styles.equippedSlot} ${styles.healingSlot} ${skillId ? styles.slotFilled : ''} ${isLocked ? styles.slotLocked : ''}`}
                    onClick={() => {
                      if (isLocked || !skillId) return;
                      setSelectedHealing(prev =>
                        prev.filter((_, idx) => idx !== i)
                      );
                    }}
                  >
                    {skillId ? (
                      <>
                        <span className={styles.slotIcon}>
                          {getSkillIcon(skillId)}
                        </span>
                        <span className={styles.slotName}>
                          {getSkillName(skillId, t.skillNames)}
                        </span>
                        {!isLocked && (
                          <span className={styles.slotRemove}>×</span>
                        )}
                      </>
                    ) : (
                      <span className={styles.slotPlus}>+</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.slotGroup}>
            <div className={styles.slotGroupHeader}>
              <span className={styles.slotGroupLabel}>
                {t.preparation.passiveSkillsLabel}
              </span>
              <span className={styles.slotCounter}>
                {selectedPassives.length}/{REQUIRED_PASSIVE_COUNT}
              </span>
            </div>
            <div className={styles.passiveSlots}>
              {Array.from({ length: REQUIRED_PASSIVE_COUNT }).map((_, i) => {
                const skillId = selectedPassives[i];
                return (
                  <div
                    key={`passive-${i}`}
                    className={`${styles.slot} ${styles.equippedSlot} ${styles.passiveSlot} ${skillId ? styles.slotFilled : ''} ${isLocked ? styles.slotLocked : ''}`}
                    onClick={() => {
                      if (isLocked || !skillId) return;
                      setSelectedPassives(prev =>
                        prev.filter((_, idx) => idx !== i)
                      );
                    }}
                  >
                    {skillId ? (
                      <>
                        <span className={styles.slotIcon}>
                          {getSkillIcon(skillId)}
                        </span>
                        <span className={styles.slotName}>
                          {getSkillName(skillId, t.skillNames)}
                        </span>
                        {!isLocked && (
                          <span className={styles.slotRemove}>×</span>
                        )}
                      </>
                    ) : (
                      <span className={styles.slotPlus}>+</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          {t.preparation.activeSkillsLabel}
        </h3>
        <div className={styles.skillGrid}>
          {activeSkills.map((skill: ActiveSkill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              selected={selectedActives.includes(skill.id)}
              disabled={
                isLocked ||
                (!selectedActives.includes(skill.id) && activeSlotsFull)
              }
              onClick={handleSelectActive}
              onOpenDetail={setDetailSkill}
            />
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          {t.preparation.healingSkillsLabel}
        </h3>
        <div className={styles.skillGrid}>
          {healingSkills.map((skill: HealingSkill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              selected={selectedHealing.includes(skill.id)}
              disabled={
                isLocked ||
                (!selectedHealing.includes(skill.id) && healingSlotsFull)
              }
              onClick={handleSelectHealing}
              onOpenDetail={setDetailSkill}
            />
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          {t.preparation.passiveSkillsLabel}
        </h3>
        <div className={styles.skillGrid}>
          {passiveSkills.map((skill: PassiveSkill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              selected={selectedPassives.includes(skill.id)}
              disabled={
                isLocked ||
                (!selectedPassives.includes(skill.id) && passiveSlotsFull)
              }
              onClick={handleSelectPassive}
              onOpenDetail={setDetailSkill}
            />
          ))}
        </div>
      </div>

      {!isGameOver && (
        <div className={styles.actions}>
          {isLocked && (
            <p className={styles.waitingMessage}>
              {t.preparation.waitingForPlayers
                .replace(
                  '{ready}',
                  String(room.players.filter(p => p.ready).length)
                )
                .replace('{total}', String(room.players.length))}
            </p>
          )}
          <div className={styles.actionButtons}>
            <Button
              variant={ButtonVariant.PRIMARY}
              onClick={handleReady}
              disabled={!isSelectionComplete || isLocked}
            >
              {t.preparation.readyButton}
            </Button>
            <Button onClick={handleReset}>{t.preparation.resetButton}</Button>
          </div>
        </div>
      )}

      <SkillDetailSheet
        skill={detailSkill}
        onClose={() => setDetailSkill(null)}
      />
    </div>
  );
}

export default function Preparation({
  room,
  isSpectator,
}: PreparationProps & { isSpectator: boolean }): ReactElement {
  return isSpectator ? (
    <SpectatorPreparation room={room} />
  ) : (
    <PreparationPlayer room={room} />
  );
}
