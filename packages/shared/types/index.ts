import type { GAME_IDS, ROOM_STATES } from '../constants';

export type GameId = (typeof GAME_IDS)[keyof typeof GAME_IDS];

export interface BasePlayer {
  id: string;
  name: string;
}

export interface BaseRules {
  /**
   * checkbox, number or dropdown
   */
  [key: string]: boolean | number | string;
}

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

export * from './socket';
