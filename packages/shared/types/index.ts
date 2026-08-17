import type { GameId, ROOM_STATES } from '../constants/index.js';

/**
 * Runtime game metadata provided by the server.
 * Used by the client to display game info without hardcoding.
 */
export interface GameMetadata {
  id: GameId;
  name: string;
  emoji: string;
  color: string;
  minPlayers: number;
  maxPlayers: number;
}

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
  /** Stable userIds that are not allowed to rejoin this room */
  blacklist: string[];
}

export * from './socket.js';
