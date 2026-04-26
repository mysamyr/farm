import type { ROOM_STATES } from '../constants';

export type GameId = 'farm';

export interface BasePlayer {
  id: string;
  name: string;
}

export type Player = BasePlayer;

export type BaseRules = Record<string, boolean>;

export type Rules = BaseRules;

export interface BaseRoom<
  TPlayer extends BasePlayer = BasePlayer,
  TRules extends BaseRules = BaseRules,
  TGame extends GameId = GameId,
> {
  id: string;
  name: string;
  ownerId: string;
  game: TGame;
  state: ROOM_STATES;
  players: TPlayer[];
  rules: TRules;
}

export type Room = BaseRoom;

export * from './socket';
