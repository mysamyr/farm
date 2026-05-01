import { ERROR, EVENTS, NOTIFICATION_TYPES } from '../constants';
import { FARM_EVENTS } from '../constants/farm';

import type { DiceAnimals, EmoteId, TradableAnimals, TradeOffer } from './farm';

import type { Room } from './index';

export type SocketAck = {
  ok: boolean;
  error?: ERROR;
};

export type RollDiceAck = SocketAck & {
  diceResult?: [DiceAnimals, DiceAnimals];
};

export type RejoinRoomAck = SocketAck & {
  room?: Room;
};

export type ServerNotification = {
  type: NOTIFICATION_TYPES;
  data: string;
};

export type RoomIdPayload = {
  roomId: string;
};

export type RoomPayload = {
  room: Room;
};

export type RoomUpdatePayload = RoomIdPayload & {
  name?: string;
  rules?: Record<string, boolean>;
};

export type GameExchangePayload = RoomIdPayload & {
  from: TradableAnimals;
  to: TradableAnimals;
};

export type PlayerRenamePayload = {
  name: string;
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
  [EVENTS.ROOM_REJOIN]: (
    payload: null,
    ack?: (response: RejoinRoomAck) => void
  ) => void;
  [EVENTS.ROOM_CREATE]: (
    payload: null,
    ack?: (response: SocketAck) => void
  ) => void;
  [EVENTS.ROOM_UPDATE]: (
    payload: RoomUpdatePayload,
    ack?: (response: SocketAck) => void
  ) => void;
  [EVENTS.ROOM_JOIN]: (
    payload: RoomIdPayload,
    ack?: (response: SocketAck) => void
  ) => void;
  [EVENTS.ROOM_LEAVE]: (
    payload: RoomIdPayload,
    ack?: (response: SocketAck) => void
  ) => void;
  [EVENTS.ROOM_CLOSE]: (
    payload: RoomIdPayload,
    ack?: (response: SocketAck) => void
  ) => void;
  [EVENTS.PLAYER_RENAME]: (
    payload: PlayerRenamePayload,
    ack?: (response: SocketAck) => void
  ) => void;
  [EVENTS.GAME_START]: (
    payload: RoomIdPayload,
    ack?: (response: SocketAck) => void
  ) => void;
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
  [EVENTS.CONNECT]: () => void;
  [EVENTS.ROOMS_LIST]: (rooms: Room[]) => void;
  [EVENTS.ROOM_CLOSED]: () => void;
  [EVENTS.NOTIFICATION]: (payload: ServerNotification) => void;
  [EVENTS.ONLINE_COUNT]: (online: number) => void;
  [EVENTS.GAME_STARTED]: (payload: RoomPayload) => void;
  [FARM_EVENTS.GAME_UPDATE]: (payload: RoomPayload) => void;
  [FARM_EVENTS.GAME_EMOTE_SENT]: (payload: EmoteSentPayload) => void;
};
