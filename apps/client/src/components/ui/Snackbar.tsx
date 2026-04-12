import type { ReactElement } from 'react';

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
      className="snackbar-container"
      onMouseEnter={() => undefined}
      onMouseLeave={() => undefined}
    >
      <div className="snackbar-label">{message}</div>
      <div className="snackbar-dismiss" onClick={onClose}>
        ×
      </div>
    </div>
  ) : (
    <></>
  );
}
