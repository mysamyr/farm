import type { TradableAnimals } from '../game/game.types';

export type Player = {
  id: string;
  name: string;
  exchangedThisTurn: boolean;
  animals: Record<TradableAnimals, number>;
};

export type RenamePlayerReq = {
  name: string;
};
