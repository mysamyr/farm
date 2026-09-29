import { memo, type ReactElement } from 'react';

import { Tooltip } from '@game/client-core/components';

import type { EffectId } from '@game/game-arena/shared';

import EffectDescription from './EffectDescription.js';
import styles from './EffectTooltip.module.css';

type EffectTooltipProps = {
  effectId: EffectId;
  label: string;
};

function EffectTooltip({ effectId, label }: EffectTooltipProps): ReactElement {
  return (
    <Tooltip
      trigger="hover-click"
      className={styles.wrapper}
      content={<EffectDescription effectId={effectId} />}
    >
      <button type="button" className={styles.badge}>
        {label}
      </button>
    </Tooltip>
  );
}

export default memo(EffectTooltip);
