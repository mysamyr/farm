import {
  type HTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useRef,
  useState,
} from 'react';

import { useClickOutside, useEscapeKey } from '../../hooks/index.js';
import { classNames } from '../../utils/index.js';
import {
  getTooltipPlacement,
  type TooltipAlign,
  type TooltipPosition,
} from '../../utils/overlay.js';

import styles from './Tooltip.module.css';

/**
 * - `hover`: shows on hover (hover-capable devices only).
 * - `hover-click`: `hover` + toggles on click/tap.
 */
export type TooltipTrigger = 'hover' | 'hover-click';

type TooltipProps = Omit<HTMLAttributes<HTMLElement>, 'content'> & {
  content: ReactNode;
  children: ReactNode;
  trigger?: TooltipTrigger;
  as?: 'span' | 'div';
  tooltipClassName?: string;
  /** Minimum space (px) above the anchor required to show the tooltip above. */
  minSpaceAbove?: number;
  /** Distance (px) to a viewport edge at which the tooltip aligns to that edge. */
  edgeOffset?: number;
};

const alignClassMap: Record<TooltipAlign, string | undefined> = {
  left: styles.alignLeft,
  center: styles.alignCenter,
  right: styles.alignRight,
};

function isHoverDevice(): boolean {
  return !window.matchMedia('(hover: none)').matches;
}

export default function Tooltip({
  content,
  children,
  trigger = 'hover',
  as: Wrapper = 'span',
  className,
  tooltipClassName,
  minSpaceAbove = 160,
  edgeOffset = 110,
  onClick,
  onMouseEnter,
  onMouseLeave,
  ...rest
}: TooltipProps): ReactElement {
  const wrapperRef = useRef<HTMLDivElement & HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>('above');
  const [align, setAlign] = useState<TooltipAlign>('center');

  const close = () => setOpen(false);

  useClickOutside(wrapperRef, open, close);
  useEscapeKey(open, close);

  const show = () => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (rect) {
      const placement = getTooltipPlacement(rect, {
        minSpaceAbove,
        edgeOffset,
      });
      setPosition(placement.position);
      setAlign(placement.align);
    }
    setOpen(true);
  };

  const handleMouseEnter = (event: MouseEvent<HTMLElement>) => {
    onMouseEnter?.(event);
    if (isHoverDevice()) show();
  };

  const handleMouseLeave = (event: MouseEvent<HTMLElement>) => {
    onMouseLeave?.(event);
    if (isHoverDevice()) close();
  };

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    onClick?.(event);
    if (trigger !== 'hover-click') return;
    event.stopPropagation();
    if (open) {
      close();
    } else {
      show();
    }
  };

  return (
    <Wrapper
      {...rest}
      ref={wrapperRef}
      className={classNames(styles.wrapper, className)}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {open && (
        <Wrapper
          role="tooltip"
          className={classNames(
            styles.tooltip,
            position === 'above' ? styles.above : styles.below,
            alignClassMap[align],
            tooltipClassName
          )}
        >
          {content}
        </Wrapper>
      )}
    </Wrapper>
  );
}
