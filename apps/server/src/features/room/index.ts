import {
  DEFAULT_CONFIG,
  ROOM_STATES,
  EVENTS,
  NOTIFICATION_TYPES,
} from '@game/shared/constants';

import type { Room } from '@game/shared/types';
import type { Room as FarmRoom } from '@game/shared/types/farm';
import type { RejoinRoomAck } from '@game/shared/types/socket';

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

import type {
  CloseRoomReq,
  JoinRoomReq,
  LeaveRoomReq,
  UpdateRoomReq,
} from './room.types';

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
          error: 'Please enter your name before creating a room.',
        });
      return;
    }

    if (listRooms().find(r => r.players.some(p => p.id === socket.id))) {
      if (ack)
        ack({
          ok: false,
          error:
            'You are already in a room. Please leave your current room before creating a new one.',
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
  (req: UpdateRoomReq, ack?: AckFunc): void => {
    log(LogLevel.DEBUG, 'event:room:update', {
      socketId: socket.id,
      ...req,
    });
    const room = getRoomById(req.roomId);
    if (!room) {
      if (ack) ack({ ok: false, error: 'ROOM_NOT_FOUND' });
      return;
    }
    if (room.state !== ROOM_STATES.IDLE) {
      if (ack) ack({ ok: false, error: 'GAME_IN_PROGRESS' });
      return;
    }
    if (socket.id !== room.ownerId) {
      if (ack) ack({ ok: false, error: 'NOT_OWNER' });
      return;
    }

    if (req.name) {
      room.name = req.name;
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
  (req: JoinRoomReq, ack?: AckFunc): void => {
    log(LogLevel.DEBUG, 'event:room:join', {
      socketId: socket.id,
      roomId: req.roomId,
    });

    const room = getRoomById(req.roomId);
    if (!room) {
      if (ack) ack({ ok: false, error: 'ROOM_NOT_FOUND' });
      return;
    }
    if (room.state !== ROOM_STATES.IDLE) {
      if (ack) ack({ ok: false, error: 'GAME_IN_PROGRESS' });
      return;
    }
    if (room.players.length >= DEFAULT_CONFIG.maxPlayers) {
      if (ack) ack({ ok: false, error: 'ROOM_FULL' });
      return;
    }
    if (checkIfPlayerAlreadyInRoom(room, socket)) {
      if (ack) ack({ ok: false, error: 'NAME_TAKEN' });
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
  (req: LeaveRoomReq, ack?: AckFunc): void => {
    log(LogLevel.DEBUG, 'event:room:leave', {
      socketId: socket.id,
      roomId: req.roomId,
    });

    const room = getRoomById(req.roomId);
    if (!room) {
      if (ack) ack({ ok: false, error: 'ROOM_NOT_FOUND' });
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
  (req: CloseRoomReq, ack?: AckFunc): void => {
    log(LogLevel.DEBUG, 'event:room:close', {
      socketId: socket.id,
      roomId: req.roomId,
    });

    const room = getRoomById(req.roomId);
    if (!room) {
      if (ack) ack({ ok: false, error: 'ROOM_NOT_FOUND' });
      return;
    }
    if (room.ownerId !== socket.id) {
      if (ack) ack({ ok: false, error: 'NOT_OWNER' });
      return;
    }
    if (room.state === ROOM_STATES.RUNNING) {
      if (ack) ack({ ok: false, error: 'GAME_IN_PROGRESS' });
      return;
    }

    io.to(room.id).emit(EVENTS.NOTIFICATION, {
      type: NOTIFICATION_TYPES.CLOSE_ROOM,
      data: socket.data.player.name,
    });
    io.to(room.id).emit(EVENTS.ROOM_CLOSED, { roomId: req.roomId });
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
      if (ack) ack({ ok: false, error: 'ROOM_NOT_FOUND' });
      return;
    }

    log(LogLevel.INFO, 'room:rejoined', {
      roomId: room.id,
      socketId: socket.id,
    });

    if (ack) ack({ ok: true, room: room as FarmRoom });
  };

export function registerRoomFeature(io: AppServer): void {
  io.on(EVENTS.CONNECTION, (socket: AppSocket): void => {
    socket.on(EVENTS.ROOM_CREATE, createRoomHandler(io, socket));
    socket.on(EVENTS.ROOM_UPDATE, updateRoomHandler(io, socket));
    socket.on(EVENTS.ROOM_JOIN, joinRoomHandler(io, socket));
    socket.on(EVENTS.ROOM_LEAVE, leaveRoomHandler(io, socket));
    socket.on(EVENTS.ROOM_CLOSE, closeRoomHandler(io, socket));
    socket.on(EVENTS.ROOM_REJOIN, rejoinRoomHandler(io, socket));
  });
}
