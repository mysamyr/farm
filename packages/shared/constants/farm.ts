import { EVENTS } from './index';

export const DEFAULT_CONFIG = {
  maxPlayers: 4,
  minPlayers: 2,
} as const;

export const FARM_EVENTS = {
  ...EVENTS,
  GAME_ROLL_DICE: 'game:rollDice',
  GAME_EXCHANGE: 'game:exchange',
  GAME_SEND_EMOTE: 'game:sendEmote',
  GAME_UPDATE: 'game:update',
  GAME_EMOTE_SENT: 'game:emoteSent',
  GAME_TRADE_START: 'game:tradeStart',
  GAME_TRADE_UPDATE: 'game:tradeUpdate',
  GAME_TRADE_LOCK: 'game:tradeLock',
  GAME_TRADE_CONFIRM: 'game:tradeConfirm',
  GAME_TRADE_CANCEL: 'game:tradeCancel',
} as const;

export const EMOTES = [
  { id: 'laugh', emoji: '😂' },
  { id: 'love', emoji: '😍' },
  { id: 'clap', emoji: '👏' },
  { id: 'fire', emoji: '🔥' },
  { id: 'tongue', emoji: '😝' },
  { id: 'sad', emoji: '😢' },
] as const;

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
  ALLOW_PLAYER_TRADE = 'allow_player_trade',
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
