import type { ReactElement } from 'react';

import styles from './Snackbar.module.css';

type SnackbarProps = {
  open: boolean;
  message: string;
  onClose: () => void;
};

export function Snackbar({
  open,
  message,
  onClose,
}: SnackbarProps): ReactElement {
  return open ? (
    <div
      className={styles.container}
      onMouseEnter={() => undefined}
      onMouseLeave={() => undefined}
    >
      <div className={styles.label}>{message}</div>
      <div className={styles.dismiss} onClick={onClose}>
        ×
      </div>
    </div>
  ) : (
    <></>
  );
}
