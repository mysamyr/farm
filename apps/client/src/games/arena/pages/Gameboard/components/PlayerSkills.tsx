import type { ReactElement } from 'react';

import { SKILLS } from '@game/shared/constants/arena';
import type { Player } from '@game/shared/types/arena';

import { classNames } from '../../../../../utils';

import styles from './PlayerSkills.module.css';
import SkillCard from './SkillCard';

type PlayerSkillsProps = {
  player: Player;
  isMyTurn: boolean;
  isStunned: boolean;
  onUseSkill: (skillId: string) => void;
};

export default function PlayerSkills({
  player,
  isMyTurn,
  isStunned,
  onUseSkill,
}: PlayerSkillsProps): ReactElement {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>Your Skills</span>
        {!isMyTurn && (
          <span className={styles.waitingBadge}>Opponent's turn</span>
        )}
      </div>
      <div
        className={classNames(styles.skillsGrid, !isMyTurn && styles.disabled)}
      >
        {player.skills.map(playerSkill => {
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
            />
          );
        })}
      </div>
    </div>
  );
}
