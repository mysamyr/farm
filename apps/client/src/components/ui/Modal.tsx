import { ReactElement, useEffect, useRef } from 'react';

import type { ModalCloseReason, ModalConfig } from '@game/client-core/store';

type ModalProps = {
  open: boolean;
  modal: ModalConfig | null;
  onRequestClose: (reason: ModalCloseReason) => void;
};

export function Modal({
  open,
  modal,
  onRequestClose,
}: ModalProps): ReactElement {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const ModalComponent = modal?.component;
  const modalProps = modal?.props || {};

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={event => {
        event.preventDefault();
        onRequestClose('escape');
      }}
    >
      {ModalComponent ? <ModalComponent {...modalProps} /> : null}
    </dialog>
  );
}
