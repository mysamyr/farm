import { uuid } from '@game/shared/utils';

import { LOCAL_STORAGE_KEY } from '../constants/index.js';
import type {
  MatchRecord,
  MatchResult,
  StatisticsStorage,
} from '../types/index.js';

const STORAGE_VERSION = 1;
const MAX_MATCHES_PER_GAME = 10;

export const STATISTICS_CHANGED_EVENT = 'gamehub:statistics-changed';

function emptyStorage(): StatisticsStorage {
  return { version: STORAGE_VERSION, games: {} };
}

function isMatchRecord(value: unknown): value is MatchRecord {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const match = value as Partial<MatchRecord>;
  const hasValidDuration =
    match.durationMs === undefined ||
    (typeof match.durationMs === 'number' &&
      Number.isFinite(match.durationMs) &&
      match.durationMs >= 0);

  return (
    typeof match.id === 'string' &&
    match.id.length > 0 &&
    typeof match.timestamp === 'number' &&
    Number.isFinite(match.timestamp) &&
    typeof match.winner === 'boolean' &&
    typeof match.players === 'number' &&
    Number.isInteger(match.players) &&
    match.players > 0 &&
    hasValidDuration
  );
}

function parseStorage(value: string | null): StatisticsStorage {
  if (!value) {
    return emptyStorage();
  }

  try {
    const parsed = JSON.parse(value) as Partial<StatisticsStorage>;
    if (
      parsed.version !== STORAGE_VERSION ||
      !parsed.games ||
      typeof parsed.games !== 'object' ||
      Array.isArray(parsed.games)
    ) {
      return emptyStorage();
    }

    const games = Object.fromEntries(
      Object.entries(parsed.games).flatMap(([gameId, matches]) => {
        if (!Array.isArray(matches)) {
          return [];
        }

        return [
          [gameId, matches.filter(isMatchRecord).slice(-MAX_MATCHES_PER_GAME)],
        ];
      })
    );

    return { version: STORAGE_VERSION, games };
  } catch (error) {
    console.warn('Failed to parse local game statistics', error);
    return emptyStorage();
  }
}

function readStorage(): StatisticsStorage {
  try {
    return parseStorage(
      window.localStorage.getItem(LOCAL_STORAGE_KEY.STATISTICS)
    );
  } catch (error) {
    console.warn('Failed to read local game statistics', error);
    return emptyStorage();
  }
}

function notifyStatisticsChanged(): void {
  window.dispatchEvent(new Event(STATISTICS_CHANGED_EVENT));
}

function writeStorage(storage: StatisticsStorage): boolean {
  try {
    window.localStorage.setItem(
      LOCAL_STORAGE_KEY.STATISTICS,
      JSON.stringify(storage)
    );
    notifyStatisticsChanged();
    return true;
  } catch (error) {
    console.warn('Failed to save local game statistics', error);
    return false;
  }
}

export function recordMatch(
  gameId: string,
  result: MatchResult
): MatchRecord | null {
  const storage = readStorage();
  const match: MatchRecord = {
    ...result,
    id: uuid(),
    timestamp: Date.now(),
  };

  storage.games[gameId] = [...(storage.games[gameId] ?? []), match].slice(
    -MAX_MATCHES_PER_GAME
  );

  return writeStorage(storage) ? match : null;
}

export function getGameStatistics(gameId: string): MatchRecord[] {
  return [...(readStorage().games[gameId] ?? [])];
}

export function clearAllStatistics(): boolean {
  try {
    window.localStorage.removeItem(LOCAL_STORAGE_KEY.STATISTICS);
    notifyStatisticsChanged();
    return true;
  } catch (error) {
    console.warn('Failed to clear local game statistics', error);
    return false;
  }
}
