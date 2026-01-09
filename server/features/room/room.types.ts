import type { GAME_RULES } from '../../constants';
import type { DiceAnimals, RoomState } from '../game/game.types';
import type { Player } from '../player/player.types';

export type Rule = (typeof GAME_RULES)[keyof typeof GAME_RULES];

export type Rules = Record<Rule, boolean>;

export type Room = {
  id: string;
  name: string;
  ownerId: string;
  state: RoomState;
  players: Map<string, Player>;
  rules: Rules;
  order: string[];
  turn: number;
  dice?: [DiceAnimals, DiceAnimals];
  winner?: string;
};

export type CreateRoomReq = {
  name?: string;
  rules: Rules;
};

export type UpdateRoomReq = {
  roomId: string;
  rules: Rules;
  name: string;
};

export type JoinRoomReq = {
  roomId: string;
};

export type LeaveRoomReq = {
  roomId: string;
};

export type CloseRoomReq = {
  roomId: string;
};
