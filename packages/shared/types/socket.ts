import { ERROR, GameId, EVENTS } from '../constants/index.js';

import type { BaseRoom } from './index.js';

export type SocketAck = {
  ok: boolean;
  error?: ERROR;
};

export type RejoinRoomAck = SocketAck & {
  room?: BaseRoom;
};

export type ServerNotification = {
  type: string;
  data: string;
};

export type RoomIdPayload = {
  roomId: string;
};

export type RoomKickPayload = RoomIdPayload & {
  playerId: string;
};

export type RoomCreatePayload = {
  game: GameId;
};

export type RoomPayload = {
  room: BaseRoom;
};

export type RoomUpdatePayload = RoomIdPayload & {
  name?: string;
  rules?: Record<string, boolean>;
};

export type GameActionPayload<
  TAction extends { type: string } = { type: string },
> = RoomIdPayload & {
  action: TAction;
};

export type PlayerRenamePayload = {
  name: string;
};

/**
 * Core client-to-server events for room/player management.
 * Game-specific events are merged via intersection types.
 */
export type CoreClientToServerEvents = {
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
  [EVENTS.ROOM_KICK]: (
    payload: RoomKickPayload,
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
  [EVENTS.GAME_ACTION]: (
    payload: GameActionPayload,
    ack?: (response: SocketAck) => void
  ) => void;
};

/**
 * Core server-to-client events for room/player management.
 * Game-specific events are merged via intersection types.
 */
export type GameStateUpdatePayload = {
  state: BaseRoom;
};

export type GameEffectPayload = {
  type: string;
  payload?: unknown;
};

export type GameErrorPayload = {
  code: string;
  params?: Record<string, unknown>;
};

export type CoreServerToClientEvents = {
  [EVENTS.CONNECT]: () => void;
  [EVENTS.ROOMS_LIST]: (rooms: BaseRoom[]) => void;
  [EVENTS.ROOM_CLOSED]: () => void;
  [EVENTS.NOTIFICATION]: (payload: ServerNotification) => void;
  [EVENTS.ONLINE_COUNT]: (online: number) => void;
  [EVENTS.GAME_STARTED]: (payload: RoomPayload) => void;
  [EVENTS.GAME_STATE_UPDATE]: (payload: GameStateUpdatePayload) => void;
  [EVENTS.GAME_EFFECT]: (payload: GameEffectPayload) => void;
  [EVENTS.GAME_ERROR]: (payload: GameErrorPayload) => void;
};
