import type {
  DiceAnimals,
  FarmAnimals,
  TradableAnimals,
} from '../features/game/game.types';

export const DEFAULT_CONFIG = {
  maxPlayers: 4,
  minPlayers: 2,
} as const;

export const ROOM_STATES = {
  IDLE: 'idle',
  RUNNING: 'running',
  FINISHED: 'finished',
} as const;

export const TURN_START_INDEX = 0 as const;

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

export const FARM_ANIMALS: FarmAnimals[] = [
  ANIMALS.DUCK,
  ANIMALS.GOAT,
  ANIMALS.PIG,
  ANIMALS.HORSE,
  ANIMALS.COW,
] as const;

export const BLUE_DICE: DiceAnimals[] = [
  ANIMALS.BEAR,
  ANIMALS.DUCK,
  ANIMALS.DUCK,
  ANIMALS.DUCK,
  ANIMALS.DUCK,
  ANIMALS.DUCK,
  ANIMALS.GOAT,
  ANIMALS.GOAT,
  ANIMALS.GOAT,
  ANIMALS.PIG,
  ANIMALS.PIG,
  ANIMALS.HORSE,
] as const;

export const ORANGE_DICE: DiceAnimals[] = [
  ANIMALS.FOX,
  ANIMALS.DUCK,
  ANIMALS.DUCK,
  ANIMALS.DUCK,
  ANIMALS.DUCK,
  ANIMALS.DUCK,
  ANIMALS.GOAT,
  ANIMALS.GOAT,
  ANIMALS.GOAT,
  ANIMALS.PIG,
  ANIMALS.PIG,
  ANIMALS.COW,
] as const;

export const ANIMALS_WAGES: Record<TradableAnimals, number> = {
  [ANIMALS.DUCK]: 1,
  [ANIMALS.GOAT]: 6,
  [ANIMALS.PIG]: 12,
  [ANIMALS.HORSE]: 36,
  [ANIMALS.COW]: 72,
  [ANIMALS.SMALL_DOG]: 6,
  [ANIMALS.BIG_DOG]: 36,
} as const;

export const ANIMALS_DEFAULT_QUANTITY: Record<TradableAnimals, number> = {
  [ANIMALS.DUCK]: 60,
  [ANIMALS.GOAT]: 24,
  [ANIMALS.PIG]: 20,
  [ANIMALS.HORSE]: 12,
  [ANIMALS.COW]: 8,
  [ANIMALS.SMALL_DOG]: 4,
  [ANIMALS.BIG_DOG]: 2,
} as const;

export enum GAME_RULES {
  EXTRA_DUCK = 'extra_duck',
  ONE_EXCHANGE = 'one_exchange_per_turn',
  UNLIMITED_CARDS = 'unlimited_cards',
}
