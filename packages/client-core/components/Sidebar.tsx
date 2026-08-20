import { type ReactElement, type ReactNode, useEffect } from 'react';

import { createPortal } from 'react-dom';

import { classNames } from '../utils/index.js';

import styles from './Sidebar.module.css';

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  side?: 'left' | 'right';
};

export function Sidebar({
  open,
  onClose,
  children,
  side = 'right',
}: SidebarProps): ReactElement {
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

  return createPortal(
    <div
      className={classNames(styles.root, open && styles.open)}
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
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
