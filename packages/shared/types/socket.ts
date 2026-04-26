import { ERROR, EVENTS, NOTIFICATION_TYPES } from '../constants';
import { FARM_EVENTS } from '../constants/farm';

import type {
  DiceAnimals,
  EmoteId,
  Room as FarmRoom,
  TradableAnimals,
} from './farm';

export type SocketAck = {
  ok: boolean;
  error?: ERROR;
};

export type RollDiceAck = SocketAck & {
  diceResult?: [DiceAnimals, DiceAnimals];
};

export type RejoinRoomAck = SocketAck & {
  room?: FarmRoom;
};

export type ServerNotification = {
  type: NOTIFICATION_TYPES;
  data: string;
};

export type RoomIdPayload = {
  roomId: string;
};

export type RoomPayload = {
  room: FarmRoom;
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
  [FARM_EVENTS.GAME_START]: (
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
};

export type ServerToClientEvents = {
  [EVENTS.CONNECT]: () => void;
  [EVENTS.ROOMS_LIST]: (rooms: FarmRoom[]) => void;
  [EVENTS.ROOM_CLOSED]: () => void;
  [EVENTS.NOTIFICATION]: (payload: ServerNotification) => void;
  [EVENTS.ONLINE_COUNT]: (online: number) => void;
  [FARM_EVENTS.GAME_STARTED]: (payload: RoomPayload) => void;
  [FARM_EVENTS.GAME_UPDATE]: (payload: RoomPayload) => void;
  [FARM_EVENTS.GAME_EMOTE_SENT]: (payload: EmoteSentPayload) => void;
};
