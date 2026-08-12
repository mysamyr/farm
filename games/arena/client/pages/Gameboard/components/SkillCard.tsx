import {
  type MouseEvent,
  type ReactElement,
  useCallback,
  useRef,
  useState,
} from 'react';

import { classNames } from '@game/client-core/utils';

import { type Skill, SkillType } from '@game/game-arena/shared';

import {
  getSkillEffects,
  getSkillIcon,
  getSkillName,
  getSkillCooldownText,
} from '../../../constants/index.js';
import { useArenaTranslation } from '../../../hooks/useArenaTranslation.js';

import styles from './SkillCard.module.css';

type TooltipPosition = 'above' | 'below';
type TooltipAlign = 'left' | 'center' | 'right';

type SkillCardProps = {
  skill: Skill;
  selected?: boolean;
  disabled?: boolean;
  cooldown?: number; // active CD in fight phase
  onClick?: () => void;
  onOpenDetail?: (skill: Skill) => void;
};

export default function SkillCard({
  skill,
  selected,
  disabled,
  cooldown,
  onClick,
  onOpenDetail,
}: SkillCardProps): ReactElement {
  const t = useArenaTranslation();
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition>('above');
  const [tooltipAlign, setTooltipAlign] = useState<TooltipAlign>('center');
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = useCallback(() => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setTooltipPos(rect.top > 180 ? 'above' : 'below');

      // If close to left edge, align left. If close to right edge, align right.
      if (rect.left < 80) {
        setTooltipAlign('left');
      } else if (window.innerWidth - rect.right < 80) {
        setTooltipAlign('right');
      } else {
        setTooltipAlign('center');
      }
    }
    setTooltipVisible(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltipVisible(false);
  }, []);

  const onCooldown = cooldown !== undefined && cooldown > 0;

  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  const handleInfoClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onOpenDetail?.(skill);
    },
    [skill, onOpenDetail]
  );

  const icon = getSkillIcon(skill.id);
  const name = getSkillName(skill.id, t.skillNames);
  const effects = getSkillEffects(
    skill,
    t.skillEffectLabels,
    t.statLabels,
    t.effectLabels,
    t.util
  );
  const cooldownText = getSkillCooldownText(skill, t.skillEffectLabels);

  return (
    <div
      ref={cardRef}
      className={classNames(
        styles.card,
        selected && styles.selected,
        disabled && styles.disabled,
        onCooldown && styles.onCooldown
      )}
      onClick={!disabled && !onCooldown ? handleClick : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className={styles.icon}>{icon}</span>
      <span className={styles.name}>{name}</span>
      <span
        className={classNames(
          styles.badge,
          skill.type === SkillType.passive
            ? styles.badgePassive
            : skill.type === SkillType.healing
              ? styles.badgeHealing
              : styles.badgeActive
        )}
      >
        {skill.type}
      </span>
      {onCooldown && (
        <span className={styles.cooldownBadge}>CD: {cooldown}</span>
      )}
      {onOpenDetail && (
        <button
          type="button"
          className={styles.infoButton}
          aria-label={t.skillInfoLabel}
          onClick={handleInfoClick}
        >
          i
        </button>
      )}

      {tooltipVisible && (
        <div
          className={classNames(
            styles.tooltip,
            tooltipPos === 'above' ? styles.tooltipAbove : styles.tooltipBelow,
            tooltipAlign === 'left' && styles.tooltipAlignLeft,
            tooltipAlign === 'right' && styles.tooltipAlignRight,
            tooltipAlign === 'center' && styles.tooltipAlignCenter
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
              {cooldownText && (
                <li key="cooldown" className={styles.tooltipCooldown}>
                  {cooldownText}
                </li>
              )}
            </ul>
          ) : (
            <p className={styles.tooltipEmpty}>No effects</p>
          )}
        </div>
      )}
    </div>
  );
}
