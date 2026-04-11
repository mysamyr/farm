import type { TradableAnimals } from './game';

export type Player = {
  id: string;
  name: string;
  exchangedThisTurn: boolean;
  animals: Record<TradableAnimals, number>;
};
