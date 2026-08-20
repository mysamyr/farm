import { useShallow } from 'zustand/react/shallow';

import { useSnackbarStore } from '../store/index.js';

export function useSnackbar() {
  return useSnackbarStore(
    useShallow(s => ({
      open: s.open,
      message: s.message,
      showSnackbar: s.showSnackbar,
      closeSnackbar: s.closeSnackbar,
    }))
  );
}
