import {
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  useEffect,
} from 'react';

import { createPortal } from 'react-dom';

import { classNames } from '@game/client-core/utils';

import { useSidebarSwipe } from '../../hooks/useSidebarSwipe.js';

import styles from './Sidebar.module.css';

type SidebarProps = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  children: ReactNode;
  side?: 'left' | 'right';
};

export function Sidebar({
  open,
  onOpen,
  onClose,
  children,
  side = 'right',
}: SidebarProps): ReactElement {
  const { phase, progress, finishSettling } = useSidebarSwipe({
    enabled: side === 'right' && !open,
    onOpen,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const swipeStyle = {
    '--sidebar-swipe-progress': progress,
    '--sidebar-swipe-translate': `${(1 - progress) * 100}%`,
  } as CSSProperties;

  return createPortal(
    <div
      className={classNames(
        styles.root,
        open && styles.open,
        phase === 'dragging' && styles.dragging,
        phase === 'settling' && styles.settling
      )}
      style={swipeStyle}
      aria-hidden={!open}
    >
      <div
        className={styles.overlay}
        onClick={onClose}
        aria-label="Close sidebar"
      />
      <div
        className={classNames(
          styles.panel,
          side === 'left' ? styles.left : styles.right
        )}
        role="dialog"
        aria-modal="true"
        onTransitionEnd={event => {
          if (
            event.target === event.currentTarget &&
            event.propertyName === 'transform'
          ) {
            finishSettling();
          }
        }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
