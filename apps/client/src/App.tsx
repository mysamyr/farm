import { useEffect } from 'react';

import { Modal, Snackbar } from '@game/client-core/components';
import { PATHS } from '@game/client-core/constants';
import type { AccentColor } from '@game/client-core/constants';
import {
  useActiveGame,
  useGames,
  useGamesLoader,
  useModal,
  useRoom,
  useRoomSubscriptions,
  useSnackbar,
  useTheme,
  useUnloadWarning,
} from '@game/client-core/hooks';
import { applyAccentColor } from '@game/client-core/utils';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';

import { GameSubscriptions } from './components/GameSubscriptions';
import { GameContainer } from './games';
import Dashboard from './pages/Dashboard';

function AppContent() {
  const { open: modalOpen, modal, requestCloseModal } = useModal();
  const { open: snackbarOpen, message, closeSnackbar } = useSnackbar();
  const { currentRoom } = useRoom();
  const { activeGame } = useActiveGame();
  const { theme } = useTheme();
  const { games, loading: gamesLoading, error: gamesError, getGame } = useGames();

  const location = useLocation();

  // Get accent color from the loaded game metadata
  const gameMetadata = getGame(activeGame);
  const accentColor = (gameMetadata?.color ?? 'orange') as AccentColor;

  // Load games from server on mount
  useGamesLoader();

  useRoomSubscriptions();

  useUnloadWarning(currentRoom);

  useEffect(() => {
    applyAccentColor(accentColor);
  }, [accentColor]);

  // Sync theme with DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    requestCloseModal();
  }, [location.pathname, requestCloseModal]);

  // Show loading state while fetching games
  if (gamesLoading && games.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Show error state if games failed to load
  if (gamesError && games.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '1rem' }}>
        <p>Failed to load games: {gamesError}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <>
      <GameSubscriptions key={activeGame} gameId={activeGame} />
      <Routes>
        <Route path={PATHS.DASHBOARD} element={<Dashboard />} />
        {currentRoom && (
          <Route
            path={PATHS.GAME_BOARD}
            element={<GameContainer gameId={activeGame} />}
          />
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
