export { ERROR } from './errors.js';

export enum GameId {
  farm = 'farm',
  arena = 'arena',
}

export enum GameColor {
  purple = 'purple',
  orange = 'orange',
  blue = 'blue',
  teal = 'teal',
}

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
  ROOM_KICK: 'room:kick',
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
  GAME_ACTION: 'game:action',
  GAME_STATE_UPDATE: 'game:state_update',
  GAME_EFFECT: 'game:effect',
  GAME_ERROR: 'game:error',
  GAME_REMATCH: 'game:rematch',
  GAME_RETURN_TO_LOBBY: 'game:return_to_lobby',
} as const;

export const REMATCH_TIMEOUT_MS = 20_000;

export const NOTIFICATION_TYPES = {
  PLAYER_JOINED: 'player_joined',
  PLAYER_LEFT: 'player_left',
  PLAYER_KICKED: 'player_kicked',
  CLOSE_ROOM: 'close_room',
  GAME_FINISHED: 'game_finished',
} as const;

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
