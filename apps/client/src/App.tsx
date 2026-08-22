import { useEffect } from 'react';

import {
  ChangeNameModal,
  Modal,
  PostGameOverlay,
  Snackbar,
} from '@game/client-core/components';
import { PATHS, getCatalogPath } from '@game/client-core/constants';
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
  useUsername,
} from '@game/client-core/hooks';
import { applyAccentColor, applyTheme } from '@game/client-core/utils';
import { GameColor } from '@game/shared/constants';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';

import { GameSubscriptions } from './components/GameSubscriptions.js';
import { MainLayout } from './components/layout/MainLayout.js';
import { GameContainer } from './games/index.js';
import CatalogPage from './pages/Catalog/index.js';
import GamePage from './pages/GamePage/index.js';

function GamePlayPage() {
  const { activeGame } = useActiveGame();

  if (!activeGame) {
    return <Navigate to={getCatalogPath()} replace />;
  }

  return <GameContainer gameId={activeGame} />;
}

function AppContent() {
  const { open: modalOpen, modal, requestCloseModal, showModal } = useModal();
  const { open: snackbarOpen, message, closeSnackbar } = useSnackbar();
  const { currentRoom } = useRoom();
  const { activeGame } = useActiveGame();
  const { theme } = useTheme();
  const { isValid: hasUsername } = useUsername();
  const location = useLocation();
  const {
    games,
    loading: gamesLoading,
    error: gamesError,
    getGame,
  } = useGames();

  const gameMetadata = activeGame ? getGame(activeGame) : undefined;
  const accentColor = gameMetadata?.color ?? GameColor.purple;

  useGamesLoader();

  useRoomSubscriptions();

  useUnloadWarning(currentRoom);

  useEffect(() => {
    applyAccentColor(accentColor);
  }, [accentColor]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (modal?.closeOnNavigate === false) {
      return;
    }
    requestCloseModal();
  }, [location.pathname, modal?.closeOnNavigate, requestCloseModal]);

  useEffect(() => {
    if (hasUsername) {
      return;
    }
    if (modalOpen && modal?.component === ChangeNameModal) {
      return;
    }
    showModal({
      component: ChangeNameModal,
      props: { required: true },
      closeOnNavigate: false,
    });
  }, []);

  if (gamesLoading && games.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  if (gamesError && games.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          gap: '1rem',
        }}
      >
        <p>Failed to load games: {gamesError}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <>
      {activeGame && <GameSubscriptions key={activeGame} gameId={activeGame} />}
      <PostGameOverlay />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path={PATHS.CATALOG} element={<CatalogPage />} />
          <Route path={PATHS.GAME_BOARD} element={<GamePlayPage />} />
          <Route path={PATHS.GAME} element={<GamePage />} />
        </Route>
        <Route path="*" element={<Navigate to={getCatalogPath()} replace />} />
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
