import {
  ERROR,
  EVENTS,
  GameId,
  NOTIFICATION_TYPES,
  ROOM_STATES,
  VALIDATION,
} from '@game/shared/constants';

import type {
  BasePlayer,
  BaseRoom,
  RoomCreatePayload,
} from '@game/shared/types';
import type {
  RejoinRoomAck,
  RoomIdPayload,
  RoomKickPayload,
  RoomUpdatePayload,
} from '@game/shared/types';

import { LogLevel } from '../../constants/index.js';
import { gameRegistry } from '../../games/index.js';
import { log } from '../../services/logger.js';
import type { AckFunc, AppServer, AppSocket } from '../../types/index.js';
import { checkIfPlayerAlreadyInRoom } from '../player/player.helpers.js';

import {
  returnRoomToLobby,
  startRoomGame,
  voteRematch,
} from './rematch.service.js';
import { canStartGame } from './room.helpers.js';

import {
  createRoom,
  deleteRoom,
  getActiveRoom,
  getRoomById,
  kickPlayerFromRoom,
  leaveRoom,
  listRooms,
  removePlayerFromRoom,
  updateRoomsList,
} from './room.service.js';

function createRoomPlayer(player: BasePlayer): BasePlayer {
  return {
    id: player.id,
    name: player.name,
  };
}

const createRoomHandler =
  (io: AppServer, socket: AppSocket) =>
  (req: RoomCreatePayload, ack?: AckFunc): void => {
    log(LogLevel.DEBUG, 'event:room:create', {
      socketId: socket.id,
      game: req.game,
    });

    if (!req.game || !GameId[req.game]) {
      if (ack) {
        ack({
          ok: false,
          error: ERROR.GAME_NOT_FOUND,
        });
      }
      return;
    }

    if (!socket.data.player.name) {
      if (ack) {
        ack({
          ok: false,
          error: ERROR.NO_USERNAME,
        });
      }
      return;
    }

    if (listRooms().find(r => r.players.some(p => p.id === socket.id))) {
      if (ack) {
        ack({
          ok: false,
          error: ERROR.ALREADY_IN_ROOM,
        });
      }
      return;
    }

    const room: BaseRoom = createRoom(socket.id, req.game);
    room.players.push(createRoomPlayer(socket.data.player));
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
    if (room.blacklist.includes(socket.data.userId)) {
      if (ack) ack({ ok: false, error: ERROR.PLAYER_KICKED });
      return;
    }
    const gameConfig = gameRegistry.getConfig(room.game);
    if (room.players.length >= gameConfig.maxPlayers) {
      if (ack) ack({ ok: false, error: ERROR.ROOM_FULL });
      return;
    }
    if (checkIfPlayerAlreadyInRoom(room, socket)) {
      if (ack) ack({ ok: false, error: ERROR.NAME_TAKEN });
      return;
    }

    room.players.push(createRoomPlayer(socket.data.player));
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

const kickRoomHandler =
  (io: AppServer, socket: AppSocket) =>
  (req: RoomKickPayload, ack?: AckFunc): void => {
    log(LogLevel.DEBUG, 'event:room:kick', {
      socketId: socket.id,
      roomId: req.roomId,
      playerId: req.playerId,
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
    if (req.playerId === room.ownerId || req.playerId === socket.id) {
      if (ack) ack({ ok: false, error: ERROR.CANNOT_KICK });
      return;
    }
    if (!room.players.some(p => p.id === req.playerId)) {
      if (ack) ack({ ok: false, error: ERROR.PLAYER_NOT_FOUND });
      return;
    }

    const ok = kickPlayerFromRoom(io, room, req.playerId);
    if (!ok) {
      if (ack) ack({ ok: false, error: ERROR.CANNOT_KICK });
      return;
    }

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

    if (ack) ack({ ok: true, room });
  };

const startGameHandler =
  (io: AppServer, socket: AppSocket) =>
  (req: RoomIdPayload, ack?: AckFunc): void => {
    log(LogLevel.DEBUG, 'event:game:start', {
      socketId: socket.id,
      roomId: req.roomId,
    });

    const room = getRoomById(req.roomId);
    if (!room) {
      ack?.({ ok: false, error: ERROR.ROOM_NOT_FOUND });
      return;
    }
    if (room.ownerId !== socket.id) {
      ack?.({ ok: false, error: ERROR.NOT_OWNER });
      return;
    }
    if (!canStartGame(room)) {
      ack?.({ ok: false, error: ERROR.CANNOT_START });
      return;
    }

    const gameModule = gameRegistry.get(room.game);
    if (gameModule.canStartGame && !gameModule.canStartGame(room)) {
      ack?.({ ok: false, error: ERROR.CANNOT_START });
      return;
    }

    startRoomGame(io, room);
    ack?.({ ok: true });
  };

const rematchHandler =
  (io: AppServer, socket: AppSocket) =>
  (req: RoomIdPayload, ack?: AckFunc): void => {
    log(LogLevel.DEBUG, 'event:game:rematch', {
      socketId: socket.id,
      roomId: req.roomId,
    });

    const room = getRoomById(req.roomId);
    if (!room) {
      ack?.({ ok: false, error: ERROR.ROOM_NOT_FOUND });
      return;
    }
    if (room.state !== ROOM_STATES.FINISHED || !room.rematch) {
      ack?.({ ok: false, error: ERROR.GAME_NOT_RUNNING });
      return;
    }
    if (!room.players.some(player => player.id === socket.id)) {
      ack?.({ ok: false, error: ERROR.PLAYER_NOT_FOUND });
      return;
    }

    const ok = voteRematch(io, room, socket.id);
    ack?.({ ok });
  };

const returnToLobbyHandler =
  (io: AppServer, socket: AppSocket) =>
  (req: RoomIdPayload, ack?: AckFunc): void => {
    log(LogLevel.DEBUG, 'event:game:return_to_lobby', {
      socketId: socket.id,
      roomId: req.roomId,
    });

    const room = getRoomById(req.roomId);
    if (!room) {
      ack?.({ ok: false, error: ERROR.ROOM_NOT_FOUND });
      return;
    }
    if (room.state !== ROOM_STATES.FINISHED) {
      ack?.({ ok: false, error: ERROR.GAME_NOT_RUNNING });
      return;
    }
    if (!room.players.some(player => player.id === socket.id)) {
      ack?.({ ok: false, error: ERROR.PLAYER_NOT_FOUND });
      return;
    }

    returnRoomToLobby(io, room);
    ack?.({ ok: true });
  };

export function registerRoomFeature(io: AppServer, socket: AppSocket): void {
  socket.on(EVENTS.ROOM_CREATE, createRoomHandler(io, socket));
  socket.on(EVENTS.ROOM_UPDATE, updateRoomHandler(io, socket));
  socket.on(EVENTS.ROOM_JOIN, joinRoomHandler(io, socket));
  socket.on(EVENTS.ROOM_LEAVE, leaveRoomHandler(io, socket));
  socket.on(EVENTS.ROOM_KICK, kickRoomHandler(io, socket));
  socket.on(EVENTS.ROOM_CLOSE, closeRoomHandler(io, socket));
  socket.on(EVENTS.ROOM_REJOIN, rejoinRoomHandler(io, socket));
  socket.on(EVENTS.GAME_START, startGameHandler(io, socket));
  socket.on(EVENTS.GAME_REMATCH, rematchHandler(io, socket));
  socket.on(EVENTS.GAME_RETURN_TO_LOBBY, returnToLobbyHandler(io, socket));
}
