/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useState, useCallback } from 'react';

interface ModalContextType {
  open: boolean;
  modalComponent: React.ComponentType<any> | null;
  showModal: <T extends Record<string, any>>(
    component: React.ComponentType<T>
  ) => void;
  closeModal: () => void;
}

export const ModalContext = createContext<ModalContextType | undefined>(
  undefined
);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [modalComponent, setModalComponent] =
    useState<React.ComponentType<any> | null>(null);

  const closeModal = useCallback(() => {
    setOpen(false);
    // Clear modal component after animation completes
    setTimeout(() => {
      setModalComponent(null);
    }, 200);
  }, []);

  const showModal = useCallback(
    <T extends Record<string, any>>(component: React.ComponentType<T>) => {
      setModalComponent(() => component);
      setOpen(true);
    },
    []
  );

  return (
    <ModalContext.Provider
      value={{
        open,
        modalComponent,
        showModal,
        closeModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}
