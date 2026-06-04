import { type ReactElement, useState } from 'react';

import { BASE_SKILLS, SKILLS } from '@game/shared/constants/arena';
import type { Player, Skill } from '@game/shared/types/arena';

import Button from '../../../../../components/ui/Button';
import { BUTTON_VARIANT } from '../../../../../constants';
import { useArenaTranslation } from '../../../hooks/useArenaTranslation';

import styles from './PlayerSkills.module.css';
import SkillCard from './SkillCard';
import SkillDetailSheet from './SkillDetailSheet';

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
  const [detailSkill, setDetailSkill] = useState<{ def: Skill; currentCooldown: number; disabled: boolean } | null>(null);
  const baseSkillIds = new Set(BASE_SKILLS.map(skill => skill.id));

  const skillsByType = player.skills.reduce(
    (acc, playerSkill) => {
      const skillDef = SKILLS.find(s => s.id === playerSkill.id);
      if (!skillDef) return acc;

      if (baseSkillIds.has(playerSkill.id)) {
        acc.base.push(playerSkill);
      } else if (skillDef.type === 'active') {
        acc.active.push(playerSkill);
      } else if (skillDef.type === 'healing') {
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

      <div
        className={styles.skillsGrid}
      >
        {[
          ...skillsByType.base,
          ...skillsByType.active,
          ...skillsByType.healing,
        ].map(playerSkill => {
          const skillDef = SKILLS.find(s => s.id === playerSkill.id);
          if (!skillDef) return null;

          const disabled =
            !isMyTurn ||
            (isStunned ? playerSkill.id !== 'skip' : playerSkill.cooldown > 0);

          return (
            <SkillCard
              key={playerSkill.id}
              skill={skillDef}
              cooldown={playerSkill.cooldown}
              disabled={disabled}
              onClick={() => onUseSkill(playerSkill.id)}
              onOpenDetail={(skill) => setDetailSkill({ def: skill, currentCooldown: playerSkill.cooldown, disabled })}
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
