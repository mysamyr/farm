import { DEFAULT_CONFIG, ROOM_STATES, EVENTS } from '../../constants';
import { log } from '../../services/logger';
import { checkIfPlayerAlreadyInRoom } from '../player/player.helpers';

import {
  createRoom,
  deleteRoom,
  getRoomById,
  leaveRoom,
  listRooms,
  removePlayerFromRoom,
  updateRoomsList,
} from './room.service';

import type {
  CloseRoomReq,
  CreateRoomReq,
  JoinRoomReq,
  LeaveRoomReq,
  Room,
  UpdateRoomReq,
} from './room.types';
import type { AckFunc } from '../../types';
import type { Server, Socket } from 'socket.io';

const createRoomHandler =
  (io: Server, socket: Socket) =>
  (req: CreateRoomReq, ack?: AckFunc): void => {
    log('debug', 'event:room:create', {
      socketId: socket.id,
      name: req.name,
    });

    if (!socket.data.player.name) {
      if (ack)
        ack({
          ok: false,
          error: 'Please enter your name before creating a room.',
        });
      return;
    }

    if (listRooms().find(r => r.players.has(socket.id))) {
      if (ack)
        ack({
          ok: false,
          error:
            'You are already in a room. Please leave your current room before creating a new one.',
        });
      return;
    }

    const room: Room = createRoom({
      name: req.name,
      ownerId: socket.id,
    });
    room.players.set(socket.id, socket.data.player);
    socket.join(room.id);
    updateRoomsList(io);
    if (ack) ack({ ok: true });
  };

const updateRoomHandler =
  (io: Server, socket: Socket) =>
  (req: UpdateRoomReq, ack?: AckFunc): void => {
    log('debug', 'event:room:update', {
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
    updateRoomsList(io);
    if (ack) ack({ ok: true });
  };

const joinRoomHandler =
  (io: Server, socket: Socket) =>
  (req: JoinRoomReq, ack?: AckFunc): void => {
    log('debug', 'event:room:join', {
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
    if (room.players.size >= DEFAULT_CONFIG.maxPlayers) {
      if (ack) ack({ ok: false, error: 'ROOM_FULL' });
      return;
    }
    if (checkIfPlayerAlreadyInRoom(room, socket)) {
      if (ack) ack({ ok: false, error: 'NAME_TAKEN' });
      return;
    }

    room.players.set(socket.id, socket.data.player);
    socket.join(room.id);
    updateRoomsList(io);
    if (ack) ack({ ok: true });

    log('info', 'room:joined', {
      roomId: req.roomId,
      socketId: socket.id,
      playerName: socket.data.player.name,
    });
  };

const leaveRoomHandler =
  (io: Server, socket: Socket) =>
  (req: LeaveRoomReq, ack?: AckFunc): void => {
    log('debug', 'event:room:leave', {
      socketId: socket.id,
      roomId: req.roomId,
    });

    const room = getRoomById(req.roomId);
    if (!room) {
      if (ack) ack({ ok: false, error: 'ROOM_NOT_FOUND' });
      return;
    }

    removePlayerFromRoom(io, room, socket);
    if (ack) ack({ ok: true });
  };

const closeRoomHandler =
  (io: Server, socket: Socket) =>
  (req: CloseRoomReq, ack?: AckFunc): void => {
    log('debug', 'event:room:close', {
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

    log('info', 'room:closed', { roomId: req.roomId });
  };

export function registerRoomFeature(io: Server): void {
  io.on('connection', (socket: Socket): void => {
    socket.on(EVENTS.ROOM_CREATE, createRoomHandler(io, socket));
    socket.on(EVENTS.ROOM_UPDATE, updateRoomHandler(io, socket));
    socket.on(EVENTS.ROOM_JOIN, joinRoomHandler(io, socket));
    socket.on(EVENTS.ROOM_LEAVE, leaveRoomHandler(io, socket));
    socket.on(EVENTS.ROOM_CLOSE, closeRoomHandler(io, socket));
  });
}
