import React from 'react';

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { Modal } from './components/ui/Modal';
import { Snackbar } from './components/ui/Snackbar';
import { PATHS } from './constants';
import { GAME_WIN_EVENT } from './constants/events';
import { LanguageProvider } from './contexts/languageContext';
import { ModalProvider } from './contexts/modalContext';
import { RoomsProvider } from './contexts/roomsContext';
import { SnackbarProvider } from './contexts/snackbarContext';
import { useModal } from './hooks/useModal';
import { useRoom } from './hooks/useRoom';
import { useSnackbar } from './hooks/useSnackbar';
import { useSocketSubscriptions } from './hooks/useSocketSubscriptions';
import { useUnloadWarning } from './hooks/useUnloadWarning';
import Dashboard from './pages/Dashboard';
import Gameboard from './pages/Gameboard';

function AppContent() {
  const { open: modalOpen, modalComponent, closeModal } = useModal();
  const {
    open: snackbarOpen,
    showSnackbar,
    message,
    closeSnackbar,
  } = useSnackbar();
  const { currentRoom } = useRoom();

  useSocketSubscriptions({
    pushSnackbar: showSnackbar,
    onCurrentUserWon: () => {
      window.dispatchEvent(new CustomEvent(GAME_WIN_EVENT));
    },
  });

  useUnloadWarning(currentRoom);

  return (
    <>
      <Routes>
        <Route path={PATHS.DASHBOARD} element={<Dashboard />} />
        {currentRoom && (
          <Route path={PATHS.GAME_BOARD} element={<Gameboard />} />
        )}
        <Route path="*" element={<Navigate to={PATHS.DASHBOARD} replace />} />
      </Routes>

      <Snackbar open={snackbarOpen} message={message} onClose={closeSnackbar} />
      <Modal
        open={modalOpen}
        ModalComponent={modalComponent}
        onClose={closeModal}
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <SnackbarProvider>
          <ModalProvider>
            <RoomsProvider>
              <AppContent />
            </RoomsProvider>
          </ModalProvider>
        </SnackbarProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
