import {
  DEFAULT_CONFIG,
  ROOM_STATES,
  EVENTS,
  NOTIFICATION_TYPES,
  VALIDATION,
  ERROR,
} from '@game/shared/constants';

import type { Room } from '@game/shared/types';
import {
  RejoinRoomAck,
  RoomIdPayload,
  RoomUpdatePayload,
} from '@game/shared/types';
import type { Room as FarmRoom } from '@game/shared/types/farm';

import { LogLevel } from '../../constants';
import { log } from '../../services/logger';
import type { AckFunc, AppServer, AppSocket } from '../../types';
import { checkIfPlayerAlreadyInRoom } from '../player/player.helpers';

import {
  createRoom,
  deleteRoom,
  getActiveRoom,
  getRoomById,
  leaveRoom,
  listRooms,
  removePlayerFromRoom,
  updateRoomsList,
} from './room.service';

const createRoomHandler =
  (io: AppServer, socket: AppSocket) =>
  (_req: null, ack?: AckFunc): void => {
    log(LogLevel.DEBUG, 'event:room:create', {
      socketId: socket.id,
    });

    if (!socket.data.player.name) {
      if (ack)
        ack({
          ok: false,
          error: ERROR.NO_USERNAME,
        });
      return;
    }

    if (listRooms().find(r => r.players.some(p => p.id === socket.id))) {
      if (ack)
        ack({
          ok: false,
          error: ERROR.ALREADY_IN_ROOM,
        });
      return;
    }

    const room: Room = createRoom(socket.id);
    room.players.push(socket.data.player);
    void socket.join(room.id);
    updateRoomsList(io);
    if (ack) ack({ ok: true });
  };

const updateRoomHandler =
  (io: AppServer, socket: AppSocket) =>
  (req: RoomUpdatePayload, ack?: AckFunc): void => {
    log(LogLevel.DEBUG, 'event:room:update', {
      socketId: socket.id,
      ...req,
    });
    const room = getRoomById(req.roomId);
    if (!room) {
      if (ack) ack({ ok: false, error: ERROR.ROOM_NOT_FOUND });
      return;
    }
    if (room.state !== ROOM_STATES.IDLE) {
      if (ack) ack({ ok: false, error: ERROR.GAME_IN_PROGRESS });
      return;
    }
    if (socket.id !== room.ownerId) {
      if (ack) ack({ ok: false, error: ERROR.NOT_OWNER });
      return;
    }

    if (req.name) {
      const nextName = req.name.trim();
      const nextNameLength = [...nextName].length;
      if (
        nextNameLength < VALIDATION.ROOM_NAME.MIN_LENGTH ||
        nextNameLength > VALIDATION.ROOM_NAME.MAX_LENGTH
      ) {
        if (ack) ack({ ok: false, error: ERROR.INVALID_ROOM_NAME });
        return;
      }

      room.name = nextName;
    }
    if (req.rules) {
      room.rules = { ...room.rules, ...req.rules };
    }
    log(LogLevel.INFO, 'room:updated', {
      roomId: req.roomId,
      socketId: socket.id,
      name: req.name,
      rules: req.rules,
    });
    updateRoomsList(io);
    if (ack) ack({ ok: true });
  };

const joinRoomHandler =
  (io: AppServer, socket: AppSocket) =>
  (req: RoomIdPayload, ack?: AckFunc): void => {
    log(LogLevel.DEBUG, 'event:room:join', {
      socketId: socket.id,
      roomId: req.roomId,
    });

    const room = getRoomById(req.roomId);
    if (!room) {
      if (ack) ack({ ok: false, error: ERROR.ROOM_NOT_FOUND });
      return;
    }
    if (room.state !== ROOM_STATES.IDLE) {
      if (ack) ack({ ok: false, error: ERROR.GAME_IN_PROGRESS });
      return;
    }
    if (room.players.length >= DEFAULT_CONFIG.maxPlayers) {
      if (ack) ack({ ok: false, error: ERROR.ROOM_FULL });
      return;
    }
    if (checkIfPlayerAlreadyInRoom(room, socket)) {
      if (ack) ack({ ok: false, error: ERROR.NAME_TAKEN });
      return;
    }

    room.players.push(socket.data.player);
    void socket.join(room.id);

    io.to(room.id).emit(EVENTS.NOTIFICATION, {
      type: NOTIFICATION_TYPES.PLAYER_JOINED,
      data: socket.data.player.name,
    });

    updateRoomsList(io);
    if (ack) ack({ ok: true });

    log(LogLevel.INFO, 'room:joined', {
      roomId: req.roomId,
      socketId: socket.id,
      playerName: socket.data.player.name,
    });
  };

const leaveRoomHandler =
  (io: AppServer, socket: AppSocket) =>
  (req: RoomIdPayload, ack?: AckFunc): void => {
    log(LogLevel.DEBUG, 'event:room:leave', {
      socketId: socket.id,
      roomId: req.roomId,
    });

    const room = getRoomById(req.roomId);
    if (!room) {
      if (ack) ack({ ok: false, error: ERROR.ROOM_NOT_FOUND });
      return;
    }

    removePlayerFromRoom(io, room, socket);

    io.to(room.id).emit(EVENTS.NOTIFICATION, {
      type: NOTIFICATION_TYPES.PLAYER_LEFT,
      data: socket.data.player.name,
    });

    if (ack) ack({ ok: true });
  };

const closeRoomHandler =
  (io: AppServer, socket: AppSocket) =>
  (req: RoomIdPayload, ack?: AckFunc): void => {
    log(LogLevel.DEBUG, 'event:room:close', {
      socketId: socket.id,
      roomId: req.roomId,
    });

    const room = getRoomById(req.roomId);
    if (!room) {
      if (ack) ack({ ok: false, error: ERROR.ROOM_NOT_FOUND });
      return;
    }
    if (room.ownerId !== socket.id) {
      if (ack) ack({ ok: false, error: ERROR.NOT_OWNER });
      return;
    }
    if (room.state === ROOM_STATES.RUNNING) {
      if (ack) ack({ ok: false, error: ERROR.GAME_IN_PROGRESS });
      return;
    }

    io.to(room.id).emit(EVENTS.NOTIFICATION, {
      type: NOTIFICATION_TYPES.CLOSE_ROOM,
      data: socket.data.player.name,
    });
    io.to(room.id).emit(EVENTS.ROOM_CLOSED);
    const sockets = io.sockets.adapter.rooms.get(room.id);
    if (sockets) {
      for (const sid of sockets) {
        leaveRoom(io, room.id, sid);
      }
    }
    deleteRoom(room.id);
    updateRoomsList(io);
    if (ack) ack({ ok: true });

    log(LogLevel.INFO, 'room:closed', { roomId: req.roomId });
  };

const rejoinRoomHandler =
  (_io: AppServer, socket: AppSocket) =>
  (_req: null, ack?: AckFunc<RejoinRoomAck>): void => {
    log(LogLevel.DEBUG, 'event:room:rejoin', {
      socketId: socket.id,
    });

    const room = getActiveRoom(socket.id);
    if (!room) {
      if (ack) ack({ ok: false, error: ERROR.ROOM_NOT_FOUND });
      return;
    }

    log(LogLevel.INFO, 'room:rejoined', {
      roomId: room.id,
      socketId: socket.id,
    });

    if (ack) ack({ ok: true, room: room as FarmRoom });
  };

export function registerRoomFeature(io: AppServer, socket: AppSocket): void {
  socket.on(EVENTS.ROOM_CREATE, createRoomHandler(io, socket));
  socket.on(EVENTS.ROOM_UPDATE, updateRoomHandler(io, socket));
  socket.on(EVENTS.ROOM_JOIN, joinRoomHandler(io, socket));
  socket.on(EVENTS.ROOM_LEAVE, leaveRoomHandler(io, socket));
  socket.on(EVENTS.ROOM_CLOSE, closeRoomHandler(io, socket));
  socket.on(EVENTS.ROOM_REJOIN, rejoinRoomHandler(io, socket));
}
