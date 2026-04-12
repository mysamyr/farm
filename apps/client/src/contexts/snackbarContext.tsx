import React, { createContext, useState, useCallback } from 'react';

interface SnackbarContextType {
  open: boolean;
  message: string;
  showSnackbar: (message: string, duration?: number) => void;
  closeSnackbar: () => void;
}

export const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined
);

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const closeSnackbar = useCallback(() => {
    setOpen(false);
  }, []);

  const showSnackbar = useCallback(
    (msg: string, duration = 5000) => {
      setMessage(msg);
      setOpen(true);

      // Clear any existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Set new timeout
      const newTimeoutId = setTimeout(() => {
        setOpen(false);
      }, duration);

      setTimeoutId(newTimeoutId);
    },
    [timeoutId]
  );

  return (
    <SnackbarContext.Provider
      value={{
        open,
        message,
        showSnackbar,
        closeSnackbar,
      }}
    >
      {children}
    </SnackbarContext.Provider>
  );
}
