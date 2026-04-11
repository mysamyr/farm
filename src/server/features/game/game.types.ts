import type { TradableAnimals } from '@shared/types';

export type StartGameReq = { roomId: string };

export type RollDiceReq = { roomId: string };

export type ExchangeReq = {
  roomId: string;
  from: TradableAnimals;
  to: TradableAnimals;
};
