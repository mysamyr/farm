import { memo, type ReactElement } from 'react';

import { classNames } from '@game/client-core/utils';

import type { EffectId } from '@game/game-arena/shared';

import { getEffectIcon } from '../constants/index.js';
import {
  useArenaHelpTranslation,
  useArenaTranslation,
} from '../hooks/useArenaTranslation.js';

import styles from './EffectDescription.module.css';

type EffectDescriptionProps = {
  effectId: EffectId;
  /** Renders icon, name and text on a single compact line. */
  compact?: boolean;
};

function EffectDescription({
  effectId,
  compact = false,
}: EffectDescriptionProps): ReactElement {
  const { effectLabels } = useArenaTranslation();
  const help = useArenaHelpTranslation();
  const name = effectLabels[effectId] ?? effectId;

  if (compact) {
    return (
      <p className={classNames(styles.text, styles.compact)}>
        <span aria-hidden>{getEffectIcon(effectId)}</span>{' '}
        <span className={styles.compactName}>{name}</span> —{' '}
        {help.effects[effectId]}
      </p>
    );
  }

  return (
    <div className={styles.effect}>
      <div className={styles.header}>
        <span className={styles.icon} aria-hidden>
          {getEffectIcon(effectId)}
        </span>
        <span className={styles.name}>{name}</span>
      </div>
      <p className={styles.text}>{help.effects[effectId]}</p>
    </div>
  );
}

export default memo(EffectDescription);
