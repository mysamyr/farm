export const LOCAL_STORAGE_KEY = {
  LANGUAGE: 'farm:language',
  USERNAME: 'farm:username',
  THEME: 'farm:theme',
  USER_ID: 'farm:userId',
  CURRENT_ROOM_ID: 'farm:currentRoomId',
} as const;

export const PATHS = {
  DASHBOARD: '/',
  GAME_BOARD: '/game',
} as const;

export function getDashboardPath(gameId?: string): string {
  return gameId ? `${PATHS.DASHBOARD}?game=${gameId}` : PATHS.DASHBOARD;
}

export enum ButtonVariant {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  DANGER = 'danger',
  SUCCESS = 'success',
  ICON = 'icon',
}

export * from './language.js';
export * from './theme.js';
export * from './events.js';
