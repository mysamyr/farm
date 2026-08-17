import { type ReactElement, useState } from 'react';

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
  isStunned: boolean;
  disabled?: boolean;
  onUseSkill: (skillId: string) => void;
};

export default function PlayerSkills({
  player,
  isMyTurn,
  isStunned,
  disabled = false,
  onUseSkill,
}: PlayerSkillsProps): ReactElement {
  const t = useArenaTranslation();
  const [detailSkill, setDetailSkill] = useState<Skill | null>(null);
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
        <span className={styles.sectionLabel}>{t.fight.yourSkillsLabel}</span>
      </div>

      <div className={styles.skillsGrid}>
        {[
          ...skillsByType.base,
          ...skillsByType.active,
          ...skillsByType.healing,
        ].map(playerSkill => {
          const skillDef = SKILLS[playerSkill.id];
          if (!skillDef) return null;

          const skillDisabled =
            disabled ||
            !isMyTurn ||
            (isStunned
              ? playerSkill.id !== SkillId.skip
              : playerSkill.cooldown > 0);

          return (
            <SkillCard
              key={playerSkill.id}
              skill={skillDef}
              cooldown={playerSkill.cooldown}
              disabled={skillDisabled}
              onClick={() => onUseSkill(playerSkill.id)}
              onOpenDetail={setDetailSkill}
            />
          );
        })}
      </div>

      {detailSkill && (
        <SkillDetailSheet
          skill={detailSkill}
          onClose={() => setDetailSkill(null)}
        />
      )}
    </div>
  );
}
