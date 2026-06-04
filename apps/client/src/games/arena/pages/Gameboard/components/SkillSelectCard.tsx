import { type ReactElement, useCallback, useRef, useState } from 'react';

import type { Skill } from '@game/shared/types/arena';

import { classNames } from '../../../../../utils';
import {
  getSkillEffects,
  getSkillIcon,
  getSkillName,
} from '../../../constants';

import styles from './SkillSelectCard.module.css';

type TooltipPosition = 'above' | 'below';

type SkillSelectCardProps = {
  skill: Skill;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
  onOpenDetail: (skill: Skill) => void;
};

export default function SkillSelectCard({
  skill,
  selected,
  disabled,
  onSelect,
  onOpenDetail,
}: SkillSelectCardProps): ReactElement {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition>('above');
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = useCallback(() => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setTooltipPos(rect.top > 180 ? 'above' : 'below');
    }
    setTooltipVisible(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltipVisible(false);
  }, []);

  const handleClick = useCallback(() => {
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    if (isCoarse) {
      onOpenDetail(skill);
    } else {
      onSelect();
    }
  }, [skill, onSelect, onOpenDetail]);

  const icon = getSkillIcon(skill.id);
  const name = getSkillName(skill.id);
  const effects = getSkillEffects(skill);

  return (
    <div
      ref={cardRef}
      className={classNames(
        styles.card,
        selected && styles.selected,
        disabled && styles.disabled
      )}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className={styles.icon}>{icon}</span>
      <span className={styles.name}>{name}</span>
      <span
        className={classNames(
          styles.badge,
          skill.type === 'passive' ? styles.badgePassive : styles.badgeActive
        )}
      >
        {skill.type}
      </span>
      {selected && <span className={styles.checkmark}>✓</span>}

      {tooltipVisible && (
        <div
          className={classNames(
            styles.tooltip,
            tooltipPos === 'above' ? styles.tooltipAbove : styles.tooltipBelow
          )}
        >
          <div className={styles.tooltipHeader}>
            <span className={styles.tooltipIcon}>{icon}</span>
            <span className={styles.tooltipName}>{name}</span>
          </div>
          {effects.length > 0 ? (
            <ul className={styles.tooltipEffects}>
              {effects.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          ) : (
            <p className={styles.tooltipEmpty}>No effects</p>
          )}
        </div>
      )}
    </div>
  );
}
