import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { Modal } from './components/ui/Modal';
import { Snackbar } from './components/ui/Snackbar';
import { PATHS } from './constants';
import { GAME_WIN_EVENT } from './constants/events';
import './games';
import { getDefaultGameConfig } from './games/registry';
import { useModal } from './hooks/useModal';
import { useRoom } from './hooks/useRoom';
import { useRoomSubscriptions } from './hooks/useRoomSubscriptions';
import { useSnackbar } from './hooks/useSnackbar';
import { useUnloadWarning } from './hooks/useUnloadWarning';
import Dashboard from './pages/Dashboard';

function AppContent() {
  const { open: modalOpen, modal, requestCloseModal } = useModal();
  const { open: snackbarOpen, message, closeSnackbar } = useSnackbar();
  const { currentRoom } = useRoom();

  const { GameboardPage, useGameSubscriptions } = getDefaultGameConfig();

  useRoomSubscriptions();
  useGameSubscriptions({
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
          <Route path={PATHS.GAME_BOARD} element={<GameboardPage />} />
        )}
        <Route path="*" element={<Navigate to={PATHS.DASHBOARD} replace />} />
      </Routes>

      {snackbarOpen && <Snackbar message={message} onClose={closeSnackbar} />}
      <Modal
        open={modalOpen}
        modal={modal}
        onRequestClose={requestCloseModal}
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
