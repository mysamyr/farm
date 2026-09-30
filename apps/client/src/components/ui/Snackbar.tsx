import type { ReactElement } from 'react';

import { Button, CloseIcon } from '@game/client-core/components';
import { ButtonVariant } from '@game/client-core/constants';
import { useLanguage } from '@game/client-core/hooks';

import styles from './Snackbar.module.css';

type SnackbarProps = {
  message: string;
  onClose: () => void;
};

export function Snackbar({ message, onClose }: SnackbarProps): ReactElement {
  const { translation } = useLanguage();

  return (
    <div className={styles.container} role="status" aria-live="polite">
      <div className={styles.label}>{message}</div>
      <Button
        variant={ButtonVariant.ICON}
        className={styles.dismiss}
        aria-label={translation.close}
        onClick={onClose}
      >
        <CloseIcon />
      </Button>
    </div>
  );
}
