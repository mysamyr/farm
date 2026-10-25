import type { ReactElement } from 'react';

import { ButtonVariant } from '../../constants/index.js';
import { useModal } from '../../hooks/index.js';
import Button from '../Button.js';

import styles from './ConfirmationModal.module.css';

export type ConfirmationModalProps = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
};

function ConfirmationModal({
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
}: ConfirmationModalProps): ReactElement {
  const { closeModal } = useModal();

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>{message}</p>
      <div className={styles.actions}>
        <Button
          variant={ButtonVariant.SECONDARY}
          onClick={() => {
            closeModal();
          }}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={ButtonVariant.DANGER}
          onClick={() => {
            closeModal();
            onConfirm();
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}

export default ConfirmationModal;
