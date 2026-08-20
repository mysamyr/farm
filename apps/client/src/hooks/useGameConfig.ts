import { useEffect, useState } from 'react';

import type { GameConfig } from '@game/client-core/types';
import type { GameId } from '@game/shared/constants';

import { gameRegistry } from '../games/registry.js';

/**
 * Hook to load a game plugin configuration.
 * Returns the config once loaded, undefined while loading.
 */
export function useGameConfig(gameId: GameId | null): {
  config: GameConfig | undefined;
  loading: boolean;
  error: Error | null;
} {
  const [config, setConfig] = useState<GameConfig | undefined>(() =>
    gameId ? gameRegistry.getConfig(gameId) : undefined
  );
  const [loading, setLoading] = useState(!!gameId && !config);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!gameId) {
      setConfig(undefined);
      setLoading(false);
      setError(null);
      return;
    }

    // If already loaded, return early
    if (gameRegistry.isLoaded(gameId)) {
      setConfig(gameRegistry.getConfig(gameId));
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    gameRegistry
      .loadConfig(gameId)
      .then(loadedConfig => {
        if (!cancelled) {
          setConfig(loadedConfig);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [gameId]);

  return { config, loading, error };
}
