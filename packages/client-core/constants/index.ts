export const LOCAL_STORAGE_KEY = {
  LANGUAGE: 'farm:language',
  USERNAME: 'farm:username',
  THEME: 'farm:theme',
  USER_ID: 'farm:userId',
  CURRENT_ROOM_ID: 'farm:currentRoomId',
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

export enum ButtonVariant {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  DANGER = 'danger',
  SUCCESS = 'success',
  ICON = 'icon',
  TEXT = 'text',
}

export * from './language.js';
export * from './theme.js';
export * from './events.js';
