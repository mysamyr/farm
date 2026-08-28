import { useCallback, useEffect, useRef, useState } from 'react';

import { useRoom } from '@game/client-core/hooks';
import { getSocketId } from '@game/client-core/socket';
import { ROOM_STATES } from '@game/shared/constants';

import { LOCAL_STORAGE_KEY } from '../constants/index.js';
import type { MatchRecord } from '../types/index.js';
import {
  getGameStatistics,
  recordMatch,
  STATISTICS_CHANGED_EVENT,
} from '../utils/statistics.js';

export function useGameStatistics(gameId: string | null): MatchRecord[] {
  const loadStatistics = useCallback(
    () => (gameId ? getGameStatistics(gameId) : []),
    [gameId]
  );
  const [matches, setMatches] = useState<MatchRecord[]>(loadStatistics);

  useEffect(() => {
    const refresh = (): void => {
      setMatches(loadStatistics());
    };
    const handleStorage = (event: StorageEvent): void => {
      if (
        event.storageArea === window.localStorage &&
        event.key === LOCAL_STORAGE_KEY.STATISTICS
      ) {
        refresh();
      }
    };

    refresh();
    window.addEventListener(STATISTICS_CHANGED_EVENT, refresh);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(STATISTICS_CHANGED_EVENT, refresh);
      window.removeEventListener('storage', handleStorage);
    };
  }, [loadStatistics]);

  return matches;
}

export function useGameStatisticsRecorder(): void {
  const { currentRoom } = useRoom();
  const previousRoomRef = useRef<{
    id: string;
    state: ROOM_STATES;
    startedAt?: number;
  } | null>(null);

  useEffect(() => {
    const previousRoom = previousRoomRef.current;

    if (
      currentRoom &&
      previousRoom?.id === currentRoom.id &&
      previousRoom.state === ROOM_STATES.RUNNING &&
      currentRoom.state === ROOM_STATES.FINISHED &&
      currentRoom.winner
    ) {
      const startedAt = currentRoom.startedAt ?? previousRoom.startedAt;
      recordMatch(currentRoom.game, {
        winner: currentRoom.winner === getSocketId(),
        players: currentRoom.players.length,
        ...(typeof startedAt === 'number'
          ? { durationMs: Math.max(0, Date.now() - startedAt) }
          : {}),
      });
    }

    previousRoomRef.current = currentRoom
      ? {
          id: currentRoom.id,
          state: currentRoom.state,
          startedAt:
            currentRoom.startedAt ??
            (previousRoom?.id === currentRoom.id
              ? previousRoom.startedAt
              : undefined),
        }
      : null;
  }, [currentRoom]);
}
