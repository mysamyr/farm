import type { ReactElement } from 'react';

import styles from './Snackbar.module.css';

type SnackbarProps = {
  message: string;
  onClose: () => void;
};

export function Snackbar({ message, onClose }: SnackbarProps): ReactElement {
  return (
    <div className={styles.container}>
      <div className={styles.label}>{message}</div>
      <div className={styles.dismiss} onClick={onClose}>
        ×
      </div>
    </div>
  );
}
