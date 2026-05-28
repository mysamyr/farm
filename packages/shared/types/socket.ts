import { ERROR, EVENTS } from '../constants';

import {
  ClientToServerEvents as ClientToServerFarmEvents,
  ServerToClientEvents as ServerToClientFarmEvents,
} from './farm/socket';

import type { Room, GameId } from './index';

export type SocketAck = {
  ok: boolean;
  error?: ERROR;
};

export type RejoinRoomAck = SocketAck & {
  room?: Room;
};

export type ServerNotification = {
  type: string;
  data: string;
};

export type RoomIdPayload = {
  roomId: string;
};

export type RoomCreatePayload = {
  game: GameId;
};

export type RoomPayload = {
  room: Room;
};

export type RoomUpdatePayload = RoomIdPayload & {
  name?: string;
  rules?: Record<string, boolean>;
};

export type PlayerRenamePayload = {
  name: string;
};

export type ClientToServerEvents = {
  [EVENTS.ROOM_REJOIN]: (
    payload: null,
    ack?: (response: RejoinRoomAck) => void
  ) => void;
  [EVENTS.ROOM_CREATE]: (
    payload: RoomCreatePayload,
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
} & ClientToServerFarmEvents;

export type ServerToClientEvents = {
  [EVENTS.CONNECT]: () => void;
  [EVENTS.ROOMS_LIST]: (rooms: Room[]) => void;
  [EVENTS.ROOM_CLOSED]: () => void;
  [EVENTS.NOTIFICATION]: (payload: ServerNotification) => void;
  [EVENTS.ONLINE_COUNT]: (online: number) => void;
  [EVENTS.GAME_STARTED]: (payload: RoomPayload) => void;
} & ServerToClientFarmEvents;
