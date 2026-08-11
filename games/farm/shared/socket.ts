import type { GameActionPayload } from '@game/shared/types';

import type { TradableAnimals, EmoteId, TradeOffer } from './types.js';

export type FarmGameAction =
  | { type: 'ROLL_DICE' }
  | { type: 'EXCHANGE'; from: TradableAnimals; to: TradableAnimals }
  | { type: 'SEND_EMOTE'; emoteId: EmoteId }
  | { type: 'TRADE_START'; targetPlayerId: string }
  | { type: 'TRADE_UPDATE'; offer: TradeOffer }
  | { type: 'TRADE_LOCK' }
  | { type: 'TRADE_CONFIRM' }
  | { type: 'TRADE_CANCEL' };

export type FarmGameActionPayload = GameActionPayload<FarmGameAction>;
