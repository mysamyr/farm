import { useContext } from 'react';

import { SnackbarContext } from '../contexts/snackbarContext';

export function useSnackbar() {
  const snackbarContext = useContext(SnackbarContext);

  if (!snackbarContext) {
    throw new Error('useSnackbar must be used within SnackbarProvider.');
  }

  return snackbarContext;
}
