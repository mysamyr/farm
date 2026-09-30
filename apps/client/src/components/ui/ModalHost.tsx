import { type ReactElement, useCallback, useState } from 'react';

import { Modal } from '@game/client-core/components';
import { useModal } from '@game/client-core/hooks';
import type { ModalConfig } from '@game/client-core/store';

import styles from './ModalHost.module.css';

/** Renders the global modal from the modal store. */
export function ModalHost(): ReactElement {
  const { open, modal, requestCloseModal } = useModal();
  const [rendered, setRendered] = useState<ModalConfig | null>(modal);

  // Keep the last config rendered while the exit animation runs.
  if (modal && modal !== rendered) {
    setRendered(modal);
  }

  const handleClose = useCallback(
    () => requestCloseModal('escape'),
    [requestCloseModal]
  );
  const handleExited = useCallback(() => setRendered(null), []);

  const ModalComponent = rendered?.component;

  return (
    <Modal
      open={open && Boolean(modal)}
      onClose={handleClose}
      onExited={handleExited}
      layer="modal"
      panelClassName={styles.panel}
    >
      {ModalComponent ? <ModalComponent {...(rendered?.props ?? {})} /> : null}
    </Modal>
  );
}
