import type {
  BasePlayer,
  BaseRoom,
  RoomIdPayload,
  SocketAck,
} from '@game/shared/types';

import type { ANIMALS, EMOTES, GAME_RULES } from './constants.js';

// ============================================================================
// Core Game Types
// ============================================================================

export type EmoteId = (typeof EMOTES)[number]['id'];

export type TradableAnimals =
  | ANIMALS.DUCK
  | ANIMALS.GOAT
  | ANIMALS.PIG
  | ANIMALS.HORSE
  | ANIMALS.COW
  | ANIMALS.SMALL_DOG
  | ANIMALS.BIG_DOG;

export type DiceAnimals = Exclude<ANIMALS, ANIMALS.SMALL_DOG | ANIMALS.BIG_DOG>;

export type FarmAnimals = Exclude<
  ANIMALS,
  ANIMALS.SMALL_DOG | ANIMALS.BIG_DOG | ANIMALS.FOX | ANIMALS.BEAR
>;

export interface Player extends BasePlayer {
  exchangedThisTurn: boolean;
  animals: Record<TradableAnimals, number>;
}

export type Rules = Record<GAME_RULES, boolean>;

export type TradeOffer = Partial<Record<FarmAnimals, number>>;

export interface TradeState {
  initiatorId: string;
  targetId: string;
  locked: Record<string, boolean>;
  offers: Record<string, TradeOffer>;
}

export interface Room extends BaseRoom<Player, Rules, 'farm'> {
  order: string[];
  turn: number;
  dice?: [DiceAnimals, DiceAnimals];
  winner?: string;
  trade?: TradeState;
}

// ============================================================================
// Socket Event Payloads
// ============================================================================

export type RollDiceAck = SocketAck & {
  diceResult?: [DiceAnimals, DiceAnimals];
};

export type GameExchangePayload = RoomIdPayload & {
  from: TradableAnimals;
  to: TradableAnimals;
};

export type SendEmotePayload = RoomIdPayload & {
  emoteId: EmoteId;
};

export type TradeStartPayload = RoomIdPayload & {
  targetPlayerId: string;
};

export type TradeUpdatePayload = RoomIdPayload & {
  offer: TradeOffer;
};

export type TradeLockPayload = RoomIdPayload;

export type TradeConfirmPayload = RoomIdPayload;

export type TradeCancelPayload = RoomIdPayload;

export type EmoteSentPayload = {
  emoteId: EmoteId;
  playerName: string;
};
