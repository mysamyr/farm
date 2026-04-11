export const DEFAULT_CONFIG = {
  maxPlayers: 4,
  minPlayers: 2,
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
  GAME_START: 'game:start',
  GAME_ROLL_DICE: 'game:rollDice',
  GAME_EXCHANGE: 'game:exchange',
  PLAYER_RENAME: 'player:rename',

  CONNECT: 'connect',
  ROOMS_LIST: 'room:list',
  ROOM_CLOSED: 'room:closed',
  GAME_STARTED: 'game:started',
  GAME_UPDATE: 'game:update',

  NOTIFICATION: 'notification',
} as const;

export enum ANIMALS {
  DUCK = 'DUCK',
  GOAT = 'GOAT',
  PIG = 'PIG',
  HORSE = 'HORSE',
  COW = 'COW',
  FOX = 'FOX',
  BEAR = 'BEAR',
  SMALL_DOG = 'SMALL_DOG',
  BIG_DOG = 'BIG_DOG',
}

export enum GAME_RULES {
  EXTRA_DUCK = 'extra_duck',
  ONE_EXCHANGE = 'one_exchange_per_turn',
  UNLIMITED_CARDS = 'unlimited_cards',
}

export enum NOTIFICATION_TYPES {
  PLAYER_JOINED,
  PLAYER_LEFT,
  CLOSE_ROOM,
  GAME_FINISHED,
}

export const ANIMALS_DEFAULT_QUANTITY = {
  [ANIMALS.DUCK]: 60,
  [ANIMALS.GOAT]: 24,
  [ANIMALS.PIG]: 20,
  [ANIMALS.HORSE]: 12,
  [ANIMALS.COW]: 8,
  [ANIMALS.SMALL_DOG]: 4,
  [ANIMALS.BIG_DOG]: 2,
} as const;
