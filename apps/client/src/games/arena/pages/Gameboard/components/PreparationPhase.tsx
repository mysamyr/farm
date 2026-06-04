import { type ReactElement, useCallback, useMemo, useState } from 'react';

import {
  BASE_SKILLS,
  REQUIRED_ACTIVE_COUNT,
  REQUIRED_PASSIVE_COUNT,
  SKILLS,
} from '@game/shared/constants/arena';
import { ARENA_EVENTS } from '@game/shared/constants/arena';
import type { Room, Skill, SkillId } from '@game/shared/types/arena';

import Button from '../../../../../components/ui/Button';
import { BUTTON_VARIANT } from '../../../../../constants';
import { useRoom } from '../../../../../hooks/useRoom';
import { useSnackbar } from '../../../../../hooks/useSnackbar';
import { emitEvent } from '../../../../../socket/client';
import {
  getSkillEffects,
  getSkillIcon,
  getSkillName,
} from '../../../constants';
import { getCurrentPlayer } from '../../../utils';

import styles from './PreparationPhase.module.css';
import SkillSelectCard from './SkillSelectCard';

export default function PreparationPhase(): ReactElement {
  const { currentRoom: rawCurrentRoom } = useRoom();
  const { showSnackbar } = useSnackbar();
  const room = rawCurrentRoom as unknown as Room | null;

  if (!room) {
    return <></>;
  }

  const currentPlayer = getCurrentPlayer(room);

  const [selectedActives, setSelectedActives] = useState<SkillId[]>([]);
  const [selectedPassives, setSelectedPassives] = useState<SkillId[]>([]);
  const [detailSkill, setDetailSkill] = useState<Skill | null>(null);

  const baseSkillIds = useMemo(() => new Set(BASE_SKILLS.map(s => s.id)), []);

  const activeSkills = useMemo(
    () => SKILLS.filter(s => s.type === 'active' && !baseSkillIds.has(s.id)),
    [baseSkillIds]
  );

  const passiveSkills = useMemo(
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
          if (isCoarse) showSnackbar('Active skill slots are full');
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
          if (isCoarse) showSnackbar('Passive skill slots are full');
          return prev;
        }
        return [...prev, skillId];
      });
    },
    [showSnackbar]
  );

  const handleClear = useCallback(() => {
    setSelectedActives([]);
    setSelectedPassives([]);
  }, []);

  const isReady =
    !room.winner &&
    selectedActives.length === REQUIRED_ACTIVE_COUNT &&
    selectedPassives.length === REQUIRED_PASSIVE_COUNT;

  const handleReady = useCallback(() => {
    if (!isReady) return;
    const skills = [...selectedActives, ...selectedPassives];
    emitEvent(ARENA_EVENTS.PLAYER_READY, { roomId: room.id, skills }, res => {
      if (!res.ok) {
        showSnackbar('Failed to ready up');
      }
    });
  }, [isReady, selectedActives, selectedPassives, room.id, showSnackbar]);

  const handleEquipFromDetail = useCallback(() => {
    if (!detailSkill) return;
    if (detailSkill.type === 'active') {
      handleSelectActive(detailSkill.id);
    } else {
      handleSelectPassive(detailSkill.id);
    }
    setDetailSkill(null);
  }, [detailSkill, handleSelectActive, handleSelectPassive]);

  if (currentPlayer?.ready) {
    return (
      <div className={styles.container}>
        <p className={styles.waitingMessage}>
          Waiting for opponent to select skills...
        </p>
      </div>
    );
  }

  const activeSlotsFull = selectedActives.length >= REQUIRED_ACTIVE_COUNT;
  const passiveSlotsFull = selectedPassives.length >= REQUIRED_PASSIVE_COUNT;

  return (
    <div className={styles.container}>
      {/* Equipped section */}
      <div className={styles.equippedSection}>
        <div className={styles.slotGroup}>
          <div className={styles.slotGroupHeader}>
            <span className={styles.slotGroupLabel}>Active Skills</span>
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
                  className={`${styles.slot} ${styles.activeSlot} ${skillId ? styles.slotFilled : ''}`}
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
                        {getSkillName(skillId)}
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
            <span className={styles.slotGroupLabel}>Passive Skills</span>
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
                  className={`${styles.slot} ${styles.passiveSlot} ${skillId ? styles.slotFilled : ''}`}
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
                        {getSkillName(skillId)}
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
        <h3 className={styles.sectionTitle}>Active Skills</h3>
        <div className={styles.skillGrid}>
          {activeSkills.map((skill: Skill) => (
            <SkillSelectCard
              key={skill.id}
              skill={skill}
              selected={selectedActives.includes(skill.id)}
              disabled={!selectedActives.includes(skill.id) && activeSlotsFull}
              onSelect={() => handleSelectActive(skill.id)}
              onOpenDetail={setDetailSkill}
            />
          ))}
        </div>
      </div>

      {/* Passive skill grid */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Passive Skills</h3>
        <div className={styles.skillGrid}>
          {passiveSkills.map((skill: Skill) => (
            <SkillSelectCard
              key={skill.id}
              skill={skill}
              selected={selectedPassives.includes(skill.id)}
              disabled={
                !selectedPassives.includes(skill.id) && passiveSlotsFull
              }
              onSelect={() => handleSelectPassive(skill.id)}
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
          Ready
        </Button>
        <Button variant={BUTTON_VARIANT.SECONDARY} onClick={handleClear}>
          Clear
        </Button>
      </div>

      {/* Mobile detail bottom sheet */}
      {detailSkill && (
        <>
          <div
            className={styles.overlay}
            onClick={() => setDetailSkill(null)}
          />
          <div className={styles.sheet}>
            <div className={styles.sheetHeader}>
              <span className={styles.sheetIcon}>
                {getSkillIcon(detailSkill.id)}
              </span>
              <span className={styles.sheetName}>
                {getSkillName(detailSkill.id)}
              </span>
            </div>
            <ul className={styles.sheetEffects}>
              {getSkillEffects(detailSkill).map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
            <div className={styles.sheetActions}>
              <Button
                variant={BUTTON_VARIANT.PRIMARY}
                onClick={handleEquipFromDetail}
                disabled={
                  detailSkill.type === 'active'
                    ? !selectedActives.includes(detailSkill.id) &&
                      activeSlotsFull
                    : !selectedPassives.includes(detailSkill.id) &&
                      passiveSlotsFull
                }
              >
                {(
                  detailSkill.type === 'active'
                    ? selectedActives.includes(detailSkill.id)
                    : selectedPassives.includes(detailSkill.id)
                )
                  ? 'Unequip'
                  : 'Equip'}
              </Button>
              <Button
                variant={BUTTON_VARIANT.SECONDARY}
                onClick={() => setDetailSkill(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
