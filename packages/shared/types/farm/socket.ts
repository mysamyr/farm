import { FARM_EVENTS } from '../../constants/farm';

import type { RoomIdPayload, SocketAck } from '../index';

import type {
  DiceAnimals,
  EmoteId,
  TradableAnimals,
  TradeOffer,
  Room,
} from './index';

type RoomPayload = {
  room: Room;
};

export type RollDiceAck = SocketAck & {
  diceResult?: [DiceAnimals, DiceAnimals];
};

export type GameExchangePayload = RoomIdPayload & {
  from: TradableAnimals;
  to: TradableAnimals;
};

export type SendEmotePayload = RoomIdPayload & {
  emoteId: EmoteId;
};

export type TradeStartPayload = RoomIdPayload & {
  targetPlayerId: string;
};

export type TradeUpdatePayload = RoomIdPayload & {
  offer: TradeOffer;
};

export type TradeLockPayload = RoomIdPayload;

export type TradeConfirmPayload = RoomIdPayload;

export type TradeCancelPayload = RoomIdPayload;

export type EmoteSentPayload = {
  emoteId: EmoteId;
  playerName: string;
};

export type ClientToServerEvents = {
  [FARM_EVENTS.GAME_ROLL_DICE]: (
    payload: RoomIdPayload,
    ack?: (response: RollDiceAck) => void
  ) => void;
  [FARM_EVENTS.GAME_EXCHANGE]: (
    payload: GameExchangePayload,
    ack?: (response: SocketAck) => void
  ) => void;
  [FARM_EVENTS.GAME_SEND_EMOTE]: (
    payload: SendEmotePayload,
    ack?: (response: SocketAck) => void
  ) => void;
  [FARM_EVENTS.GAME_TRADE_START]: (
    payload: TradeStartPayload,
    ack?: (response: SocketAck) => void
  ) => void;
  [FARM_EVENTS.GAME_TRADE_UPDATE]: (
    payload: TradeUpdatePayload,
    ack?: (response: SocketAck) => void
  ) => void;
  [FARM_EVENTS.GAME_TRADE_LOCK]: (
    payload: TradeLockPayload,
    ack?: (response: SocketAck) => void
  ) => void;
  [FARM_EVENTS.GAME_TRADE_CONFIRM]: (
    payload: TradeConfirmPayload,
    ack?: (response: SocketAck) => void
  ) => void;
  [FARM_EVENTS.GAME_TRADE_CANCEL]: (
    payload: TradeCancelPayload,
    ack?: (response: SocketAck) => void
  ) => void;
};

export type ServerToClientEvents = {
  [FARM_EVENTS.GAME_UPDATE]: (payload: RoomPayload) => void;
  [FARM_EVENTS.GAME_EMOTE_SENT]: (payload: EmoteSentPayload) => void;
};
