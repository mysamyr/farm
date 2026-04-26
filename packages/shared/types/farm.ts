import type { ANIMALS, GAME_RULES, EMOTES } from '../constants/farm';

import type { BasePlayer, BaseRoom } from './index';

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

export type Player = BasePlayer & {
  exchangedThisTurn: boolean;
  animals: Record<TradableAnimals, number>;
};

export type Rules = Record<GAME_RULES, boolean>;

export type Room = BaseRoom<Player, Rules, 'farm'> & {
  order: string[];
  turn: number;
  dice?: [DiceAnimals, DiceAnimals];
  winner?: string;
};
