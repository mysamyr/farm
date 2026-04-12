import type { TradableAnimals } from '@game/shared/types/farm';

export type StartGameReq = { roomId: string };

export type RollDiceReq = { roomId: string };

export type ExchangeReq = {
  roomId: string;
  from: TradableAnimals;
  to: TradableAnimals;
};
