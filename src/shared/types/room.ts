import type { GAME_RULES, ROOM_STATES } from '../constants';
import type { DiceAnimals } from './game';
import type { Player } from './player';

export type RoomState = (typeof ROOM_STATES)[keyof typeof ROOM_STATES];

export type Rule = (typeof GAME_RULES)[keyof typeof GAME_RULES];

export type Rules = Record<Rule, boolean>;

export type Room = {
  id: string;
  name: string;
  ownerId: string;
  state: RoomState;
  players: Player[];
  rules: Rules;
  order: string[];
  turn: number;
  dice?: [DiceAnimals, DiceAnimals];
  winner?: string;
};
