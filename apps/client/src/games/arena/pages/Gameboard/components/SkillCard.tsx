import type { ReactElement } from 'react';

import type { Skill } from '@game/shared/types/arena';

import { classNames } from '../../../../../utils';

import styles from './SkillCard.module.css';

type SkillCardProps = {
  skill: Skill;
  selected?: boolean;
  disabled?: boolean;
  cooldown?: number;
  onClick?: () => void;
};

export default function SkillCard({
  skill,
  selected = false,
  disabled = false,
  cooldown,
  onClick,
}: SkillCardProps): ReactElement {
  const onCooldown = cooldown !== undefined && cooldown > 0;

  return (
    <div
      className={classNames(
        styles.card,
        selected && styles.selected,
        disabled && styles.disabled,
        onCooldown && styles.onCooldown
      )}
      onClick={!disabled && !onCooldown ? onClick : undefined}
    >
      <span className={styles.skillName}>{skill.id}</span>
      <span className={styles.skillType}>{skill.type}</span>
      {onCooldown && (
        <span className={styles.cooldownBadge}>CD: {cooldown}</span>
      )}
      {skill.type === 'active' && !onCooldown && cooldown === 0 && (
        <span className={styles.cooldownBadge}>Ready</span>
      )}
    </div>
  );
}

type SkillPlaceholderProps = {
  label: string;
  filled?: boolean;
  skillName?: string;
  onClick?: () => void;
};

export function SkillPlaceholder({
  label,
  filled = false,
  skillName,
  onClick,
}: SkillPlaceholderProps): ReactElement {
  return (
    <div
      className={classNames(styles.placeholder, filled && styles.filled)}
      onClick={onClick}
    >
      {filled ? <span className={styles.skillName}>{skillName}</span> : label}
    </div>
  );
}
