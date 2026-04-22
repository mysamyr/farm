import { EVENTS, NOTIFICATION_TYPES } from '../constants';
import { FARM_EVENTS } from '../constants/farm';

import type {
  DiceAnimals,
  Room as FarmRoom,
  TradableAnimals,
  SendEmoteReq,
  EmoteSentPayload,
} from './farm';

export type SocketAck = {
  ok: boolean;
  error?: string;
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
    payload: {
      roomId: string;
      name?: string;
      rules?: Record<string, boolean>;
    },
    ack?: (response: SocketAck) => void
  ) => void;
  [EVENTS.ROOM_JOIN]: (
    payload: { roomId: string },
    ack?: (response: SocketAck) => void
  ) => void;
  [EVENTS.ROOM_LEAVE]: (
    payload: { roomId: string },
    ack?: (response: SocketAck) => void
  ) => void;
  [EVENTS.ROOM_CLOSE]: (
    payload: { roomId: string },
    ack?: (response: SocketAck) => void
  ) => void;
  [EVENTS.PLAYER_RENAME]: (
    payload: { name: string },
    ack?: (response: SocketAck) => void
  ) => void;
  [FARM_EVENTS.GAME_START]: (
    payload: { roomId: string },
    ack?: (response: SocketAck) => void
  ) => void;
  [FARM_EVENTS.GAME_ROLL_DICE]: (
    payload: { roomId: string },
    ack?: (response: RollDiceAck) => void
  ) => void;
  [FARM_EVENTS.GAME_EXCHANGE]: (
    payload: { roomId: string; from: TradableAnimals; to: TradableAnimals },
    ack?: (response: SocketAck) => void
  ) => void;
  [FARM_EVENTS.GAME_SEND_EMOTE]: (
    payload: SendEmoteReq,
    ack?: (response: SocketAck) => void
  ) => void;
};

export type ServerToClientEvents = {
  [EVENTS.CONNECT]: () => void;
  [EVENTS.ROOMS_LIST]: (rooms: FarmRoom[]) => void;
  [EVENTS.ROOM_CLOSED]: (payload: { roomId: string }) => void;
  [EVENTS.NOTIFICATION]: (payload: ServerNotification) => void;
  [EVENTS.ONLINE_COUNT]: (online: number) => void;
  [FARM_EVENTS.GAME_STARTED]: (payload: { room: FarmRoom }) => void;
  [FARM_EVENTS.GAME_UPDATE]: (payload: {
    room: FarmRoom;
    dice?: [DiceAnimals, DiceAnimals];
  }) => void;
  [FARM_EVENTS.GAME_EMOTE_SENT]: (payload: EmoteSentPayload) => void;
};
