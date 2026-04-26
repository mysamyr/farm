import { ReactElement, useEffect, useRef, type ComponentType } from 'react';

type ModalProps = {
  open: boolean;
  ModalComponent: ComponentType | null;
  onClose: () => void;
};

export function Modal({
  open,
  ModalComponent,
  onClose,
}: ModalProps): ReactElement {
  const dialogRef = useRef<HTMLDialogElement>(null);

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
      onClose={onClose}
      onClick={event => {
        const dialog = dialogRef.current;
        if (!dialog) {
          return;
        }

        const rect = dialog.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        ) {
          onClose();
        }
      }}
    >
      {ModalComponent ? <ModalComponent /> : null}
    </dialog>
  );
}
