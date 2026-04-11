import type { BasePlayer, BaseRoom } from '.';
import type { ANIMALS, GAME_RULES } from '../constants/farm';

export type Animals = (typeof ANIMALS)[keyof typeof ANIMALS];

export type TradableAnimals =
  | ANIMALS.DUCK
  | ANIMALS.GOAT
  | ANIMALS.PIG
  | ANIMALS.HORSE
  | ANIMALS.COW
  | ANIMALS.SMALL_DOG
  | ANIMALS.BIG_DOG;

export type DiceAnimals = Exclude<Animals, ANIMALS.SMALL_DOG | ANIMALS.BIG_DOG>;

export type FarmAnimals = Exclude<
  Animals,
  ANIMALS.SMALL_DOG | ANIMALS.BIG_DOG | ANIMALS.FOX | ANIMALS.BEAR
>;

export type Player = BasePlayer & {
  exchangedThisTurn: boolean;
  animals: Record<TradableAnimals, number>;
};

export type Rule = (typeof GAME_RULES)[keyof typeof GAME_RULES];

export type Rules = Record<Rule, boolean>;

export type Room = BaseRoom<Player, Rules, 'farm'> & {
  order: string[];
  turn: number;
  dice?: [DiceAnimals, DiceAnimals];
  winner?: string;
};
