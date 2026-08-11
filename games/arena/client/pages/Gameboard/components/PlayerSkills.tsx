import { type ReactElement, useState } from 'react';

import { Button } from '@game/client-core/components';
import { BUTTON_VARIANT } from '@game/client-core/constants';

import {
  type Player,
  type Skill,
  SkillId,
  SKILLS,
  SkillType,
} from '@game/game-arena/shared';

import { useArenaTranslation } from '../../../hooks/useArenaTranslation.js';

import styles from './PlayerSkills.module.css';
import SkillCard from './SkillCard.js';
import SkillDetailSheet from './SkillDetailSheet.js';

type PlayerSkillsProps = {
  player: Player;
  isMyTurn: boolean;
  isGameOver: boolean;
  isStunned: boolean;
  onUseSkill: (skillId: string) => void;
};

export default function PlayerSkills({
  player,
  isMyTurn,
  isGameOver,
  isStunned,
  onUseSkill,
}: PlayerSkillsProps): ReactElement {
  const { fight: t } = useArenaTranslation();
  const [detailSkill, setDetailSkill] = useState<{
    def: Skill;
    currentCooldown: number;
    disabled: boolean;
  } | null>(null);
  const baseSkillIds = new Set([SkillId.attack, SkillId.skip]);

  const skillsByType = player.skills.reduce(
    (acc, playerSkill) => {
      const skillDef = SKILLS[playerSkill.id];
      if (!skillDef) return acc;

      if (baseSkillIds.has(playerSkill.id)) {
        acc.base.push(playerSkill);
      } else if (skillDef.type === SkillType.active) {
        acc.active.push(playerSkill);
      } else if (skillDef.type === SkillType.healing) {
        acc.healing.push(playerSkill);
      }

      return acc;
    },
    {
      base: [] as Player['skills'],
      active: [] as Player['skills'],
      healing: [] as Player['skills'],
    }
  );

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>{t.yourSkillsLabel}</span>
        {!isMyTurn && (
          <span className={styles.waitingBadge}>
            {isGameOver ? t.gameOverBadge : t.opponentTurnBadge}
          </span>
        )}
      </div>

      <div className={styles.skillsGrid}>
        {[
          ...skillsByType.base,
          ...skillsByType.active,
          ...skillsByType.healing,
        ].map(playerSkill => {
          const skillDef = SKILLS[playerSkill.id];
          if (!skillDef) return null;

          const disabled =
            !isMyTurn ||
            (isStunned
              ? playerSkill.id !== SkillId.skip
              : playerSkill.cooldown > 0);

          return (
            <SkillCard
              key={playerSkill.id}
              skill={skillDef}
              cooldown={playerSkill.cooldown}
              disabled={disabled}
              onClick={() => onUseSkill(playerSkill.id)}
              onOpenDetail={skill =>
                setDetailSkill({
                  def: skill,
                  currentCooldown: playerSkill.cooldown,
                  disabled,
                })
              }
            />
          );
        })}
      </div>

      {detailSkill && (
        <SkillDetailSheet
          skill={detailSkill.def}
          onClose={() => setDetailSkill(null)}
          actions={
            <>
              <Button
                variant={BUTTON_VARIANT.PRIMARY}
                disabled={detailSkill.disabled}
                style={{ flex: 1 }}
                onClick={() => {
                  onUseSkill(detailSkill.def.id);
                  setDetailSkill(null);
                }}
              >
                {t.useButton}
              </Button>
              <Button
                variant={BUTTON_VARIANT.SECONDARY}
                onClick={() => setDetailSkill(null)}
              >
                {t.closeButton}
              </Button>
            </>
          }
        />
      )}
    </div>
  );
}
