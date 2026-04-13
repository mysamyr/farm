import { useShallow } from 'zustand/react/shallow';

import { useModalStore } from '../store';

export function useModal() {
  return useModalStore(
    useShallow(s => ({
      open: s.open,
      modalComponent: s.modalComponent,
      showModal: s.showModal,
      closeModal: s.closeModal,
    }))
  );
}
