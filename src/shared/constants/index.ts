export const DEFAULT_CONFIG = {
  maxPlayers: 9,
  minPlayers: 1,
} as const;

export const ROOM_STATES = {
  IDLE: 'idle',
  RUNNING: 'running',
  FINISHED: 'finished',
} as const;

export const EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  ROOM_CREATE: 'room:create',
  ROOM_UPDATE: 'room:update',
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  ROOM_CLOSE: 'room:close',
  PLAYER_RENAME: 'player:rename',
  CONNECT: 'connect',
  ROOMS_LIST: 'room:list',
  ROOM_CLOSED: 'room:closed',
  NOTIFICATION: 'notification',
} as const;

export enum NOTIFICATION_TYPES {
  PLAYER_JOINED,
  PLAYER_LEFT,
  CLOSE_ROOM,
  GAME_FINISHED,
}
