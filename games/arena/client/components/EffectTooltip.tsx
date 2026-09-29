import {
  memo,
  useCallback,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
} from 'react';

import { useGameOverlay } from '@game/client-core/hooks';
import { classNames } from '@game/client-core/utils';

import type { EffectId } from '@game/game-arena/shared';

import EffectDescription from './EffectDescription.js';
import styles from './EffectTooltip.module.css';

type TooltipPosition = 'above' | 'below';
type TooltipAlign = 'left' | 'center' | 'right';

type EffectTooltipProps = {
  effectId: EffectId;
  label: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function EffectTooltip({
  effectId,
  label,
  open,
  onOpenChange,
}: EffectTooltipProps): ReactElement {
  const badgeRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState<TooltipPosition>('above');
  const [align, setAlign] = useState<TooltipAlign>('center');

  useGameOverlay(open);

  const updatePlacement = useCallback(() => {
    const rect = badgeRef.current?.getBoundingClientRect();
    if (!rect) return;

    setPosition(rect.top > 160 ? 'above' : 'below');

    if (rect.left < 110) {
      setAlign('left');
    } else if (window.innerWidth - rect.right < 110) {
      setAlign('right');
    } else {
      setAlign('center');
    }
  }, []);

  const handleMouseEnter = () => {
    if (window.matchMedia('(hover: none)').matches) return;
    updatePlacement();
    onOpenChange(true);
  };

  const handleMouseLeave = () => {
    if (window.matchMedia('(hover: none)').matches) return;
    onOpenChange(false);
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    updatePlacement();
    onOpenChange(!open);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.stopPropagation();
      event.preventDefault();
      updatePlacement();
      onOpenChange(!open);
    }
  };

  return (
    <span className={styles.wrapper}>
      <button
        ref={badgeRef}
        type="button"
        className={styles.badge}
        aria-expanded={open}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {label}
      </button>
      {open && (
        <span
          role="tooltip"
          className={classNames(
            styles.tooltip,
            position === 'above' ? styles.tooltipAbove : styles.tooltipBelow,
            align === 'left' && styles.tooltipAlignLeft,
            align === 'right' && styles.tooltipAlignRight,
            align === 'center' && styles.tooltipAlignCenter
          )}
        >
          <EffectDescription effectId={effectId} />
        </span>
      )}
    </span>
  );
}

export default memo(EffectTooltip);
