import { type ReactElement, type ReactNode } from 'react';

import { Modal } from '@game/client-core/components';

import { useSidebarSwipe } from '../../hooks/index.js';

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

  return (
    <Modal
      open={open}
      onClose={onClose}
      placement={side}
      layer="sidebar"
      closeOnBackdrop
      lockScroll
      keepMounted
      drag={{ phase, progress, onSettled: finishSettling }}
      panelClassName={styles.panel}
    >
      {children}
    </Modal>
  );
}
