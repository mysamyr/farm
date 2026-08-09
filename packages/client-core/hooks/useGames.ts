import { useEffect } from 'react';

import type { GameMetadata } from '@game/shared/types';

import { useGamesStore } from '../store';

/**
 * Fetches available games from the server and populates the games store.
 * Should be called once at app initialization.
 */
export function useGamesLoader(): void {
  const { setGames, setError, loading, games } = useGamesStore();

  useEffect(() => {
    // Skip if already loaded
    if (!loading && games.length > 0) {
      return;
    }

    const controller = new AbortController();

    async function fetchGames(): Promise<void> {
      try {
        const response = await fetch('/api/games', {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch games: ${response.status}`);
        }

        const data = (await response.json()) as GameMetadata[];
        setGames(data);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to load games');
      }
    }

    void fetchGames();

    return () => {
      controller.abort();
    };
  }, [loading, games.length, setGames, setError]);
}

/**
 * Returns the games state from the store.
 */
export function useGames() {
  const { games, loading, error, getGame, getDefaultGameId } = useGamesStore();
  return { games, loading, error, getGame, getDefaultGameId };
}
