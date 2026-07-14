import type { ANIMALS, EMOTES, GAME_RULES } from '../../constants/farm';

import type { BasePlayer, BaseRoom } from '../index';

export type EmoteId = (typeof EMOTES)[number]['id'];

export * from './socket';

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
