import { EVENTS } from './index';

export const DEFAULT_CONFIG = {
  maxPlayers: 4,
  minPlayers: 2,
} as const;

export const FARM_EVENTS = {
  ...EVENTS,
  GAME_ROLL_DICE: 'farm:rollDice',
  GAME_EXCHANGE: 'farm:exchange',
  GAME_SEND_EMOTE: 'farm:sendEmote',
  GAME_UPDATE: 'farm:update',
  GAME_EMOTE_SENT: 'farm:emoteSent',
  GAME_TRADE_START: 'farm:tradeStart',
  GAME_TRADE_UPDATE: 'farm:tradeUpdate',
  GAME_TRADE_LOCK: 'farm:tradeLock',
  GAME_TRADE_CONFIRM: 'farm:tradeConfirm',
  GAME_TRADE_CANCEL: 'farm:tradeCancel',
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
