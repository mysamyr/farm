import React from 'react';

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { Modal } from './components/ui/Modal';
import { Snackbar } from './components/ui/Snackbar';
import { PATHS } from './constants';
import { GAME_WIN_EVENT } from './constants/events';
import { useModal } from './hooks/useModal';
import { useRoom } from './hooks/useRoom';
import { useSnackbar } from './hooks/useSnackbar';
import { useSocketSubscriptions } from './hooks/useSocketSubscriptions';
import { useUnloadWarning } from './hooks/useUnloadWarning';
import Dashboard from './pages/Dashboard';
import Gameboard from './pages/Gameboard';

function AppContent() {
  const { open: modalOpen, modalComponent, closeModal } = useModal();
  const { open: snackbarOpen, message, closeSnackbar } = useSnackbar();
  const { currentRoom } = useRoom();

  useSocketSubscriptions({
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

      {snackbarOpen && <Snackbar message={message} onClose={closeSnackbar} />}
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
      <AppContent />
    </BrowserRouter>
  );
}
