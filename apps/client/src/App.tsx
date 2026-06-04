import { useEffect } from 'react';

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';

import { GameSubscriptions } from './components/GameSubscriptions';
import { Modal } from './components/ui/Modal';
import { Snackbar } from './components/ui/Snackbar';
import { PATHS } from './constants';
import './games/configs';
import { getGameConfig } from './games/registry';
import { useActiveGame } from './hooks/useActiveGame';
import { useModal } from './hooks/useModal';
import { useRoom } from './hooks/useRoom';
import { useRoomSubscriptions } from './hooks/useRoomSubscriptions';
import { useSnackbar } from './hooks/useSnackbar';
import { useTheme } from './hooks/useTheme';
import { useUnloadWarning } from './hooks/useUnloadWarning';
import Dashboard from './pages/Dashboard';
import { applyAccentColor } from './utils/theme';

function AppContent() {
  const { open: modalOpen, modal, requestCloseModal } = useModal();
  const { open: snackbarOpen, message, closeSnackbar } = useSnackbar();
  const { currentRoom } = useRoom();
  const { activeGame } = useActiveGame();
  const { theme } = useTheme();

  const location = useLocation();

  const { color, GameboardPage } = getGameConfig(activeGame);

  useRoomSubscriptions();

  useUnloadWarning(currentRoom);

  useEffect(() => {
    applyAccentColor(color);
  }, [color]);

  // Sync theme with DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    requestCloseModal();
  }, [location.pathname, requestCloseModal]);

  return (
    <>
      <GameSubscriptions key={activeGame} gameId={activeGame} />
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
