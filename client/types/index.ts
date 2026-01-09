import type { ANIMALS, ROOM_STATES, GAME_RULES } from '../constants';

export type RoomState = (typeof ROOM_STATES)[keyof typeof ROOM_STATES];

export type Rule = (typeof GAME_RULES)[keyof typeof GAME_RULES];

export type Rules = Record<Rule, boolean>;

export type Player = {
  id: string;
  name: string;
  animals: Record<TradableAnimals, number>;
  exchangedThisTurn: boolean;
};

export type Room = {
  id: string;
  name: string;
  ownerId: string;
  state: RoomState;
  players: Player[];
  rules: Rules;
  order?: string[];
  turn?: number;
  dice?: [DiceAnimals, DiceAnimals];
  winner?: string;
};

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
