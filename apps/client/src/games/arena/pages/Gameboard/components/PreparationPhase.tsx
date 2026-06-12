import { type ReactElement, useCallback, useMemo, useState } from 'react';

import {
  BASE_SKILLS,
  REQUIRED_ACTIVE_COUNT,
  REQUIRED_HEALING_COUNT,
  REQUIRED_PASSIVE_COUNT,
  SKILLS,
} from '@game/shared/constants/arena';
import { ARENA_EVENTS } from '@game/shared/constants/arena';
import type { ActiveSkill, HealingSkill, PassiveSkill, Room, Skill, SkillId } from '@game/shared/types/arena';

import Button from '../../../../../components/ui/Button';
import { BUTTON_VARIANT } from '../../../../../constants';
import { useRoom } from '../../../../../hooks/useRoom';
import { useSnackbar } from '../../../../../hooks/useSnackbar';
import { emitEvent } from '../../../../../socket/client';
import {
  getSkillIcon,
  getSkillName,
} from '../../../constants';
import { useArenaTranslation } from '../../../hooks/useArenaTranslation';
import { getCurrentPlayer } from '../../../utils';

import styles from './PreparationPhase.module.css';
import SkillCard from './SkillCard';
import SkillDetailSheet from './SkillDetailSheet';

export default function PreparationPhase(): ReactElement {
  const { currentRoom: rawCurrentRoom } = useRoom();
  const { showSnackbar } = useSnackbar();
  const t = useArenaTranslation();
  const room = rawCurrentRoom as unknown as Room | null;

  if (!room) {
    return <></>;
  }

  const currentPlayer = getCurrentPlayer(room);

  const [selectedActives, setSelectedActives] = useState<SkillId[]>([]);
  const [selectedHealing, setSelectedHealing] = useState<SkillId[]>([]);
  const [selectedPassives, setSelectedPassives] = useState<SkillId[]>([]);
  const [detailSkill, setDetailSkill] = useState<Skill | null>(null);

  const baseSkillIds = useMemo(() => new Set(BASE_SKILLS.map(s => s.id)), []);

  const activeSkills: ActiveSkill[] = useMemo(
    () => SKILLS.filter(s => s.type === 'active' && !baseSkillIds.has(s.id)) as ActiveSkill[],
    [baseSkillIds]
  );

  const healingSkills: HealingSkill[] = useMemo(
    () => SKILLS.filter(s => s.type === 'healing'),
    []
  );

  const passiveSkills: PassiveSkill[] = useMemo(
    () => SKILLS.filter(s => s.type === 'passive'),
    []
  );

  const handleSelectActive = useCallback(
    (skillId: SkillId) => {
      setSelectedActives(prev => {
        if (prev.includes(skillId)) {
          return prev.filter(id => id !== skillId);
        }
        if (prev.length >= REQUIRED_ACTIVE_COUNT) {
          const isCoarse = window.matchMedia('(pointer: coarse)').matches;
          if (isCoarse) showSnackbar(t.preparation.activeSkillsFull);
          return prev;
        }
        return [...prev, skillId];
      });
    },
    [showSnackbar]
  );

  const handleSelectPassive = useCallback(
    (skillId: SkillId) => {
      setSelectedPassives(prev => {
        if (prev.includes(skillId)) {
          return prev.filter(id => id !== skillId);
        }
        if (prev.length >= REQUIRED_PASSIVE_COUNT) {
          const isCoarse = window.matchMedia('(pointer: coarse)').matches;
          if (isCoarse) showSnackbar(t.preparation.passiveSkillsFull);
          return prev;
        }
        return [...prev, skillId];
      });
    },
    [showSnackbar]
  );

  const handleSelectHealing = useCallback(
    (skillId: SkillId) => {
      setSelectedHealing(prev => {
        if (prev.includes(skillId)) {
          return prev.filter(id => id !== skillId);
        }
        if (prev.length >= REQUIRED_HEALING_COUNT) {
          const isCoarse = window.matchMedia('(pointer: coarse)').matches;
          if (isCoarse) showSnackbar(t.preparation.healingSkillFull);
          return prev;
        }
        return [...prev, skillId];
      });
    },
    [showSnackbar]
  );

  const handleClear = useCallback(() => {
    setSelectedActives([]);
    setSelectedHealing([]);
    setSelectedPassives([]);
  }, []);

  const isReady =
    selectedActives.length === REQUIRED_ACTIVE_COUNT &&
    selectedHealing.length === REQUIRED_HEALING_COUNT &&
    selectedPassives.length === REQUIRED_PASSIVE_COUNT;

  const handleReady = useCallback(() => {
    if (!isReady) return;
    const skills = [...selectedActives, ...selectedHealing, ...selectedPassives];
    emitEvent(ARENA_EVENTS.PLAYER_READY, { roomId: room.id, skills }, res => {
      if (!res.ok) {
        showSnackbar(t.preparation.failedToReady);
      }
    });
  }, [
    isReady,
    selectedActives,
    selectedHealing,
    selectedPassives,
    room.id,
    showSnackbar,
  ]);

  const handleEquipFromDetail = useCallback(() => {
    if (!detailSkill) return;
    if (detailSkill.type === 'active') {
      handleSelectActive(detailSkill.id);
    } else if (detailSkill.type === 'healing') {
      handleSelectHealing(detailSkill.id);
    } else {
      handleSelectPassive(detailSkill.id);
    }
    setDetailSkill(null);
  }, [
    detailSkill,
    handleSelectActive,
    handleSelectHealing,
    handleSelectPassive,
  ]);

  if (room.winner) {
    const isCurrentPlayerWinner = room.winner === currentPlayer?.id;
    return (
      <div className={styles.container}>
        <div className={styles.congratsScreen}>
          <div className={styles.congratsContent}>
            {isCurrentPlayerWinner ? (
              <>
                <h2 className={styles.congratsTitle}>{t.preparation.victoryTitle}</h2>
                <p className={styles.congratsMessage}>
                  {t.preparation.victoryMessage}
                </p>
              </>
            ) : (
              <>
                <h2 className={styles.congratsTitle}>{t.preparation.opponentLeftTitle}</h2>
                <p className={styles.congratsMessage}>
                  {t.preparation.opponentLeftMessage}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentPlayer?.ready) {
    return (
      <div className={styles.container}>
        <p className={styles.waitingMessage}>
          {t.preparation.waitingForOpponent}
        </p>
      </div>
    );
  }

  const activeSlotsFull = selectedActives.length >= REQUIRED_ACTIVE_COUNT;
  const healingSlotsFull = selectedHealing.length >= REQUIRED_HEALING_COUNT;
  const passiveSlotsFull = selectedPassives.length >= REQUIRED_PASSIVE_COUNT;

  return (
    <div className={styles.container}>
      {/* Equipped section */}
      <div className={styles.equippedSection}>
        <div className={styles.slotGroup}>
          <div className={styles.slotGroupHeader}>
            <span className={styles.slotGroupLabel}>{t.preparation.activeSkillsLabel}</span>
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
                  className={`${styles.slot} ${styles.equippedSlot} ${skillId ? styles.slotFilled : ''}`}
                  onClick={() => {
                    if (skillId) {
                      setSelectedActives(prev =>
                        prev.filter((_, idx) => idx !== i)
                      );
                    }
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
                      <span className={styles.slotRemove}>×</span>
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
            <span className={styles.slotGroupLabel}>{t.preparation.healingSkillsLabel}</span>
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
                  className={`${styles.slot} ${styles.equippedSlot} ${skillId ? styles.slotFilled : ''}`}
                  onClick={() => {
                    if (skillId) {
                      setSelectedHealing(prev =>
                        prev.filter((_, idx) => idx !== i)
                      );
                    }
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
                      <span className={styles.slotRemove}>×</span>
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
            <span className={styles.slotGroupLabel}>{t.preparation.passiveSkillsLabel}</span>
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
                  className={`${styles.slot} ${styles.equippedSlot} ${skillId ? styles.slotFilled : ''}`}
                  onClick={() => {
                    if (skillId) {
                      setSelectedPassives(prev =>
                        prev.filter((_, idx) => idx !== i)
                      );
                    }
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
                      <span className={styles.slotRemove}>×</span>
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

      {/* Active skill grid */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{t.preparation.activeSkillsLabel}</h3>
        <div className={styles.skillGrid}>
          {activeSkills.map((skill: ActiveSkill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              selected={selectedActives.includes(skill.id)}
              disabled={!selectedActives.includes(skill.id) && activeSlotsFull}
              onClick={() => handleSelectActive(skill.id)}
              onOpenDetail={setDetailSkill}
            />
          ))}
        </div>
      </div>

      {/* Healing skill grid */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{t.preparation.healingSkillsLabel}</h3>
        <div className={styles.skillGrid}>
          {healingSkills.map((skill: HealingSkill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              selected={selectedHealing.includes(skill.id)}
              disabled={!selectedHealing.includes(skill.id) && healingSlotsFull}
              onClick={() => handleSelectHealing(skill.id)}
              onOpenDetail={setDetailSkill}
            />
          ))}
        </div>
      </div>

      {/* Passive skill grid */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{t.preparation.passiveSkillsLabel}</h3>
        <div className={styles.skillGrid}>
          {passiveSkills.map((skill: PassiveSkill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              selected={selectedPassives.includes(skill.id)}
              disabled={
                !selectedPassives.includes(skill.id) && passiveSlotsFull
              }
              onClick={() => handleSelectPassive(skill.id)}
              onOpenDetail={setDetailSkill}
            />
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <Button
          variant={BUTTON_VARIANT.PRIMARY}
          onClick={handleReady}
          disabled={!isReady}
        >
          {t.preparation.readyButton}
        </Button>
        <Button onClick={handleClear}>
          {t.preparation.clearButton}
        </Button>
      </div>

      {/* Mobile detail bottom sheet */}
      {detailSkill && (
        <SkillDetailSheet
          skill={detailSkill}
          onClose={() => setDetailSkill(null)}
          actions={
            <>
              <Button
                variant={BUTTON_VARIANT.PRIMARY}
                onClick={handleEquipFromDetail}
                disabled={
                  detailSkill.type === 'active'
                    ? !selectedActives.includes(detailSkill.id) &&
                      activeSlotsFull
                    : detailSkill.type === 'healing'
                      ? !selectedHealing.includes(detailSkill.id) &&
                        healingSlotsFull
                    : !selectedPassives.includes(detailSkill.id) &&
                      passiveSlotsFull
                }
              >
                {(
                  detailSkill.type === 'active'
                    ? selectedActives.includes(detailSkill.id)
                    : detailSkill.type === 'healing'
                      ? selectedHealing.includes(detailSkill.id)
                    : selectedPassives.includes(detailSkill.id)
                )
                  ? t.preparation.unequipButton
                  : t.preparation.equipButton}
              </Button>
              <Button
                variant={BUTTON_VARIANT.SECONDARY}
                onClick={() => setDetailSkill(null)}
              >
                {t.preparation.closeButton}
              </Button>
            </>
          }
        />
      )}
    </div>
  );
}
