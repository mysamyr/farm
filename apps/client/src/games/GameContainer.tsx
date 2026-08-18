import { Component, type ErrorInfo, type ReactNode, Suspense } from 'react';

import { getGamePath } from '@game/client-core/constants';
import { useConnection, useRoom } from '@game/client-core/hooks';
import type { GameId } from '@game/shared/constants';
import { Navigate } from 'react-router-dom';

import styles from './GameContainer.module.css';
import { gameRegistry } from './registry.js';

interface GameContainerProps {
  gameId: GameId;
}

/**
 * Loading fallback component while game is being loaded.
 */
function GameLoadingFallback() {
  return (
    <div className={styles.loading}>
      <div className={styles.spinner} />
      <p>Loading game...</p>
    </div>
  );
}

/**
 * Error fallback component when game fails to load.
 */
function GameErrorFallback({
  gameId,
  error,
}: {
  gameId: GameId;
  error: Error;
}) {
  return (
    <div className={styles.error}>
      <h2>Failed to load game</h2>
      <p>The game &quot;{gameId}&quot; could not be loaded.</p>
      <p className={styles.errorMessage}>{error.message}</p>
      <button onClick={() => window.location.reload()}>Reload Page</button>
    </div>
  );
}

interface ErrorBoundaryProps {
  gameId: GameId;
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Error boundary for catching game loading errors.
 */
class GameErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`Game "${this.props.gameId}" failed to load:`, error, info);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset error state when game changes
    if (prevProps.gameId !== this.props.gameId && this.state.error) {
      this.setState({ error: null });
    }
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <GameErrorFallback
          gameId={this.props.gameId}
          error={this.state.error}
        />
      );
    }
    return this.props.children;
  }
}

/**
 * Container component for rendering game-specific UI.
 * Uses React.lazy and Suspense for code splitting.
 * Includes error boundary for handling load failures.
 */
export function GameContainer({ gameId }: GameContainerProps) {
  const { currentRoom } = useRoom();
  const { rejoinSettled } = useConnection();

  if (!currentRoom) {
    if (!rejoinSettled) {
      return <GameLoadingFallback />;
    }
    return <Navigate to={getGamePath(gameId)} replace />;
  }

  // Check if we have a loader for this game
  if (!gameRegistry.hasLoader(gameId)) {
    return (
      <GameErrorFallback
        gameId={gameId}
        error={new Error('Game plugin not found')}
      />
    );
  }

  const LazyGameboard = gameRegistry.getLazyGameboard(gameId);

  return (
    <GameErrorBoundary gameId={gameId}>
      <Suspense fallback={<GameLoadingFallback />}>
        <LazyGameboard />
      </Suspense>
    </GameErrorBoundary>
  );
}
