import { useContext } from 'react';

import { ModalContext } from '../contexts/modalContext';

export function useModal() {
  const modalContext = useContext(ModalContext);

  if (!modalContext) {
    throw new Error('useModal must be used within ModalProvider.');
  }

  return modalContext;
}
