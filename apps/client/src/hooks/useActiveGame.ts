import { useCallback, useEffect } from 'react';

import { EVENTS, GAME_IDS, ROOM_STATES } from '@game/shared/constants';
import type { GameId } from '@game/shared/types';

import { useSearchParams } from 'react-router-dom';

import { emitEvent } from '../socket/client';

import { useRoom } from './useRoom';

const GAME_QUERY_PARAM = 'game';
const GAME_ID_LIST = Object.values(GAME_IDS);
const DEFAULT_GAME_ID = GAME_ID_LIST[0] as GameId;

function isGameId(value: string | null): value is GameId {
  return !!value && GAME_ID_LIST.includes(value as GameId);
}

export function useActiveGame(): {
  activeGame: GameId;
  cleanupCurrentIdleRoom: () => void;
  setActiveGame: (gameId: GameId) => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentRoom, clearCurrentRoom } = useRoom();

  const gameParam = searchParams.get(GAME_QUERY_PARAM);
  const activeGame = isGameId(gameParam) ? gameParam : DEFAULT_GAME_ID;

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
