import type { TradableAnimals } from '../../server/features/game/game.types';

export const DEFAULT_CONFIG = {
  maxPlayers: 4,
  minPlayers: 2,
} as const;

export const LOCAL_STORAGE_KEY = {
  LANGUAGE: 'farm:language',
  USERNAME: 'farm:username',
};

export const SELECTORS = {
  inputs: {
    userName: 'username',
  },
  containers: {
    roomsList: 'rooms-list',
    currentRoom: 'panel-card',
    languageDropdown: 'language-dropdown',
  },
} as const;

export enum ROOM_STATES {
  IDLE = 'idle',
  RUNNING = 'running',
  FINISHED = 'finished',
}

export const EVENTS = {
  ROOM_CREATE: 'room:create',
  ROOM_UPDATE: 'room:update',
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  ROOM_CLOSE: 'room:close',
  GAME_START: 'game:start',
  GAME_ROLL_DICE: 'game:rollDice',
  GAME_EXCHANGE: 'game:exchange',

  ROOMS_LIST: 'room:list',
  ROOM_CLOSED: 'room:closed',
  GAME_STARTED: 'game:started',
  GAME_UPDATE: 'game:update',
  GAME_FINISHED: 'game:finished',
} as const;

export const PATHS = {
  DASHBOARD: '/',
  GAME_BOARD: '/game',
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

export const ANIMALS_ICONS_CONFIG: Record<
  ANIMALS,
  Record<'label' | 'icon', string>
> = {
  [ANIMALS.DUCK]: { label: 'Duck', icon: '🦆' },
  [ANIMALS.GOAT]: { label: 'Goat', icon: '🐐' },
  [ANIMALS.PIG]: { label: 'Pig', icon: '🐖' },
  [ANIMALS.HORSE]: { label: 'Horse', icon: '🐎' },
  [ANIMALS.COW]: { label: 'Cow', icon: '🐄' },
  [ANIMALS.FOX]: { label: 'Big Dog', icon: '🦊' },
  [ANIMALS.BEAR]: { label: 'Big Dog', icon: '🐻' },
  [ANIMALS.SMALL_DOG]: { label: 'Sm. Dog', icon: '🐕' },
  [ANIMALS.BIG_DOG]: { label: 'Big Dog', icon: '🐕‍🦺' },
};

export const ANIMALS_DEFAULT_QUANTITY: Record<TradableAnimals, number> = {
  [ANIMALS.DUCK]: 60,
  [ANIMALS.GOAT]: 24,
  [ANIMALS.PIG]: 20,
  [ANIMALS.HORSE]: 12,
  [ANIMALS.COW]: 8,
  [ANIMALS.SMALL_DOG]: 4,
  [ANIMALS.BIG_DOG]: 2,
} as const;
