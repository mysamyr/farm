export { ERROR } from './errors';

export const DEFAULT_CONFIG = {
  maxPlayers: 4,
  minPlayers: 2,
} as const;

export enum ROOM_STATES {
  IDLE = 'idle',
  RUNNING = 'running',
  FINISHED = 'finished',
}

export const EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  ROOM_CREATE: 'room:create',
  ROOM_UPDATE: 'room:update',
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  ROOM_CLOSE: 'room:close',
  ROOM_REJOIN: 'room:rejoin',
  PLAYER_RENAME: 'player:rename',
  CONNECT: 'connect',
  ROOMS_LIST: 'room:list',
  ROOM_CLOSED: 'room:closed',
  NOTIFICATION: 'notification',
  ONLINE_COUNT: 'count',
  GAME_START: 'game:start',
  GAME_STARTED: 'game:started',
} as const;

export enum NOTIFICATION_TYPES {
  PLAYER_JOINED,
  PLAYER_LEFT,
  CLOSE_ROOM,
  GAME_FINISHED,
}

export const VALIDATION = {
  ROOM_NAME: {
    MAX_LENGTH: 25,
    MIN_LENGTH: 3,
  },
  USER_NAME: {
    MAX_LENGTH: 16,
    MIN_LENGTH: 2,
  },
};
