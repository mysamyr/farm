import { ERROR, EVENTS } from '../constants';

import type { BaseRoom, GameId } from './index';

// ============================================================================
// Core Socket Types
// ============================================================================

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

export type PlayerRenamePayload = {
  name: string;
};

// ============================================================================
// Core Shell Events (room management, player, connection)
// ============================================================================

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
};

/**
 * Core server-to-client events for room/player management.
 * Game-specific events are merged via intersection types.
 */
export type CoreServerToClientEvents = {
  [EVENTS.CONNECT]: () => void;
  [EVENTS.ROOMS_LIST]: (rooms: BaseRoom[]) => void;
  [EVENTS.ROOM_CLOSED]: () => void;
  [EVENTS.NOTIFICATION]: (payload: ServerNotification) => void;
  [EVENTS.ONLINE_COUNT]: (online: number) => void;
  [EVENTS.GAME_STARTED]: (payload: RoomPayload) => void;
};
