import { memo, type ReactElement } from 'react';

import { classNames } from '@game/client-core/utils';

import type { EffectId } from '@game/game-arena/shared';

import { formatEffectValue, getEffectIcon } from '../constants/index.js';
import { useArenaTranslation } from '../hooks/useArenaTranslation.js';

import styles from './EffectDescription.module.css';

type EffectDescriptionProps = {
  effectId: EffectId;
  value?: number;
};

function EffectDescription({
  effectId,
  value,
}: EffectDescriptionProps): ReactElement {
  const { effects } = useArenaTranslation();
  const effect = effects[effectId];
  const valueDescription =
    value === undefined || !effect.value
      ? undefined
      : formatEffectValue(effect.value.description, value);

  return (
    <p className={classNames(styles.text)}>
      <span aria-hidden>{getEffectIcon(effectId)}</span>{' '}
      <span>{effect.name}</span> — {effect.description}
      {valueDescription && <> {valueDescription}</>}
    </p>
  );
}

export default memo(EffectDescription);
