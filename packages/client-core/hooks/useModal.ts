import { useShallow } from 'zustand/react/shallow';

import { useModalStore } from '../store/index.js';

export function useModal() {
  return useModalStore(
    useShallow(s => ({
      open: s.open,
      modal: s.modal,
      showModal: s.showModal,
      requestCloseModal: s.requestCloseModal,
      closeModal: s.closeModal,
    }))
  );
}
