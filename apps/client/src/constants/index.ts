export const LOCAL_STORAGE_KEY = {
  THEME: 'farm:theme',
  STATISTICS: 'farm:statistics',
} as const;

export const PATHS = {
  CATALOG: '/',
  GAME: '/:gameId',
  GAME_BOARD: '/:gameId/play',
} as const;

export function getCatalogPath(): string {
  return PATHS.CATALOG;
}

export function getGamePath(gameId: string): string {
  return `/${gameId}`;
}

export function getGameBoardPath(gameId: string): string {
  return `/${gameId}/play`;
}

export function getGameIdFromPathname(pathname: string): string | undefined {
  const [gameId] = pathname.split('/').filter(Boolean);
  return gameId;
}

export function isCatalogPathname(pathname: string): boolean {
  return pathname === PATHS.CATALOG;
}

export function isGameBoardPathname(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean);
  return segments.length === 2 && segments[1] === 'play';
}

export * from './theme.js';
