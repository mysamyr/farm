import { memo, type ReactElement } from 'react';

import { classNames } from '@game/client-core/utils';

import type { Skill } from '@game/game-arena/shared';

import {
  getSkillAppliedEffects,
  getSkillCooldownText,
  getSkillEffects,
  getSkillIcon,
  getSkillName,
} from '../constants/index.js';
import { useArenaTranslation } from '../hooks/useArenaTranslation.js';

import EffectDescription from './EffectDescription.js';
import styles from './SkillDetails.module.css';

type SkillDetailsProps = {
  skill: Skill;
  /** Dense variant used inside the hover tooltip. */
  compact?: boolean;
};

export function SkillTitle({
  skill,
  compact = false,
}: SkillDetailsProps): ReactElement {
  const t = useArenaTranslation();

  return (
    <span className={classNames(styles.title, compact && styles.compact)}>
      <span className={styles.icon}>{getSkillIcon(skill.id)}</span>
      <span className={styles.name}>
        {getSkillName(skill.id, t.skillNames)}
      </span>
    </span>
  );
}

function SkillDetails({
  skill,
  compact = false,
}: SkillDetailsProps): ReactElement {
  const t = useArenaTranslation();

  const effects = getSkillEffects(
    skill,
    t.skillEffectLabels,
    t.statLabels,
    t.effects,
    t.util
  );
  const cooldownText = getSkillCooldownText(skill, t.skillEffectLabels);
  const appliedEffects = getSkillAppliedEffects(skill);

  return (
    <div className={classNames(styles.details, compact && styles.compact)}>
      {effects.length > 0 || !compact ? (
        <ul className={styles.effects}>
          {effects.map((effect, i) => (
            <li key={i}>{effect}</li>
          ))}
          {cooldownText && (
            <li key="cooldown" className={styles.cooldown}>
              {cooldownText}
            </li>
          )}
        </ul>
      ) : (
        <p className={styles.empty}>No effects</p>
      )}
      {appliedEffects.length > 0 && (
        <div className={styles.effectDetails}>
          {appliedEffects.map(effectId => (
            <EffectDescription key={effectId} effectId={effectId} />
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(SkillDetails);
