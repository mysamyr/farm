import { useCallback, useMemo } from 'react';

import { EVENTS, GameId, ROOM_STATES } from '@game/shared/constants';

import { useLocation, useNavigate } from 'react-router-dom';

import { getGameIdFromPathname, getGamePath } from '../constants/index.js';
import { emitEvent } from '../socket/index.js';
import { useGamesStore } from '../store/index.js';

import { useRoom } from './useRoom.js';

export function useActiveGame(): {
  activeGame: GameId | null;
  cleanupCurrentIdleRoom: () => void;
  setActiveGame: (gameId: GameId) => void;
} {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentRoom, clearCurrentRoom } = useRoom();
  const { games } = useGamesStore();

  const gameIdSet = useMemo(() => new Set(games.map(g => g.id)), [games]);

  const isValidGameId = useCallback(
    (value: string | undefined): value is GameId => {
      return !!value && gameIdSet.has(value as GameId);
    },
    [gameIdSet]
  );

  const gameParam = getGameIdFromPathname(location.pathname);
  const activeGame = isValidGameId(gameParam) ? gameParam : null;

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

      void navigate(getGamePath(gameId));
    },
    [activeGame, cleanupCurrentIdleRoom, navigate]
  );

  return {
    activeGame,
    cleanupCurrentIdleRoom,
    setActiveGame,
  };
}
