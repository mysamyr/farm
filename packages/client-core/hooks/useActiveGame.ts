import { useCallback, useEffect, useMemo } from 'react';

import { EVENTS, ROOM_STATES } from '@game/shared/constants';
import type { GameId } from '@game/shared/types';

import { useSearchParams } from 'react-router-dom';

import { emitEvent } from '../socket/index.js';
import { useGamesStore } from '../store/index.js';

import { useRoom } from './useRoom.js';

const GAME_QUERY_PARAM = 'game';

export function useActiveGame(): {
  activeGame: GameId;
  cleanupCurrentIdleRoom: () => void;
  setActiveGame: (gameId: GameId) => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentRoom, clearCurrentRoom } = useRoom();
  const { games, getDefaultGameId } = useGamesStore();

  // Get valid game IDs from the loaded games
  const gameIdSet = useMemo(() => new Set(games.map(g => g.id)), [games]);

  const isValidGameId = useCallback(
    (value: string | null): value is GameId => {
      return !!value && gameIdSet.has(value as GameId);
    },
    [gameIdSet]
  );

  const gameParam = searchParams.get(GAME_QUERY_PARAM);
  const defaultGameId = getDefaultGameId();
  const activeGame = isValidGameId(gameParam)
    ? gameParam
    : (defaultGameId ?? 'farm'); // fallback for initial load

  const cleanupCurrentIdleRoom = useCallback((): void => {
    if (!currentRoom || currentRoom.state !== ROOM_STATES.IDLE) {
      return;
    }

    emitEvent(EVENTS.ROOM_LEAVE, { roomId: currentRoom.id }, res => {
      if (res.ok) {
        clearCurrentRoom();
      }
    });
  }, [clearCurrentRoom, currentRoom]);

  const setActiveGame = useCallback(
    (gameId: GameId): void => {
      if (gameId !== activeGame) {
        cleanupCurrentIdleRoom();
      }

      const nextParams = new URLSearchParams(searchParams);
      nextParams.set(GAME_QUERY_PARAM, gameId);
      setSearchParams(nextParams, { replace: true });
    },
    [activeGame, cleanupCurrentIdleRoom, searchParams, setSearchParams]
  );

  useEffect(() => {
    if (searchParams.get(GAME_QUERY_PARAM) === activeGame) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set(GAME_QUERY_PARAM, activeGame);
    setSearchParams(nextParams, { replace: true });
  }, [activeGame, searchParams, setSearchParams]);

  return {
    activeGame,
    cleanupCurrentIdleRoom,
    setActiveGame,
  };
}
