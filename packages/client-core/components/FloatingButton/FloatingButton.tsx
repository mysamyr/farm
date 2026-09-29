import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';

import { classNames } from '../../utils/index.js';

import styles from './FloatingButton.module.css';

type FloatingButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  side?: 'left' | 'right';
  badge?: ReactNode;
  badgeTone?: 'accent' | 'error';
  /** Draws attention with a nudge + badge ping animation. */
  attention?: boolean;
  active?: boolean;
};

export default function FloatingButton({
  children,
  side = 'left',
  badge,
  badgeTone = 'accent',
  attention = false,
  active = false,
  className,
  type = 'button',
  ...props
}: FloatingButtonProps): ReactElement {
  const hasBadge = badge !== undefined && badge !== null && badge !== false;

  return (
    <button
      type={type}
      className={classNames(
        styles.button,
        side === 'left' ? styles.left : styles.right,
        attention && styles.attention,
        active && styles.active,
        className
      )}
      {...props}
    >
      {children}
      {hasBadge && (
        <span
          className={classNames(
            styles.badge,
            badgeTone === 'error' ? styles.badgeError : styles.badgeAccent
          )}
          aria-hidden="true"
        >
          {badge}
        </span>
      )}
    </button>
  );
}
