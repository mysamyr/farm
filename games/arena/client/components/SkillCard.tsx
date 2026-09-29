import { memo, type MouseEvent, type ReactElement } from 'react';

import { Tooltip } from '@game/client-core/components';
import { classNames } from '@game/client-core/utils';

import { type Skill, type SkillId, SkillType } from '@game/game-arena/shared';

import { getSkillIcon, getSkillName } from '../constants/index.js';
import { useArenaTranslation } from '../hooks/useArenaTranslation.js';

import styles from './SkillCard.module.css';
import SkillDetails, { SkillTitle } from './SkillDetails.js';

type SkillCardProps = {
  skill: Skill;
  selected?: boolean;
  disabled: boolean;
  cooldown?: number; // active CD in fight phase
  alwaysShowCooldown?: boolean;
  onClick: (skillId: SkillId) => void;
  onOpenDetail: (skill: Skill) => void;
};

function SkillCard({
  skill,
  selected,
  disabled,
  cooldown,
  alwaysShowCooldown = false,
  onClick,
  onOpenDetail,
}: SkillCardProps): ReactElement {
  const t = useArenaTranslation();
  const onCooldown = cooldown !== undefined && cooldown > 0;

  const handleCardClick = () => {
    if (disabled || onCooldown) return;
    onClick(skill.id);
  };

  const handleInfoClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onOpenDetail(skill);
  };

  return (
    <Tooltip
      as="div"
      trigger="hover"
      minSpaceAbove={180}
      edgeOffset={80}
      className={classNames(
        styles.card,
        selected && styles.selected,
        skill.type === SkillType.active && styles.active,
        skill.type === SkillType.healing && styles.healing,
        skill.type === SkillType.passive && styles.passive,
        disabled && styles.disabled,
        onCooldown && styles.onCooldown
      )}
      tooltipClassName={styles.tooltip}
      content={
        <>
          <SkillTitle skill={skill} compact />
          <SkillDetails skill={skill} compact />
        </>
      }
      onClick={handleCardClick}
    >
      <span className={styles.icon}>{getSkillIcon(skill.id)}</span>
      <span className={styles.name}>
        {getSkillName(skill.id, t.skillNames)}
      </span>
      {(onCooldown || (alwaysShowCooldown && cooldown !== undefined)) && (
        <span className={styles.cooldownBadge}>⏳ {cooldown}</span>
      )}
      <button
        type="button"
        className={styles.infoButton}
        aria-label={t.skillInfoLabel}
        onClick={handleInfoClick}
      >
        i
      </button>
    </Tooltip>
  );
}

export default memo(SkillCard);
