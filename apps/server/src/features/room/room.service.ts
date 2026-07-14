import {
  EVENTS,
  NOTIFICATION_TYPES,
  ROOM_STATES,
} from '@game/shared/constants';

import type { BaseRoom, GameId } from '@game/shared/types';

import { uuid } from '@game/shared/utils';

import { LogLevel } from '../../constants';
import { getGameModule } from '../../games';
import { log } from '../../services/logger';
import type { AppServer, AppSocket } from '../../types';

import {
  generateRoomName,
  shouldAutowin,
  shouldDeleteRoom,
} from './room.helpers';
import {
  getRoomById as getRoomByIdFromStore,
  getRoomsMap,
  listRooms as listRoomsFromStore,
  removeRoom,
  setRoom,
} from './room.store';

const rooms = getRoomsMap();

export const getRoomById = getRoomByIdFromStore;
export const listRooms = listRoomsFromStore;

export function deleteRoom(roomId: string): void {
  if (removeRoom(roomId)) {
    log(LogLevel.INFO, 'room:delete', { roomId });
  }
}

export function createRoom(ownerId: string, game: GameId): BaseRoom {
  const id = uuid();
  const roomFields = getGameModule(game).addRoomFields();
  const room: BaseRoom = {
    id,
    name: generateRoomName(rooms),
    ownerId,
    game,
    state: ROOM_STATES.IDLE,
    players: [],
    ...roomFields,
  };
  setRoom(room);
  log(LogLevel.INFO, 'room:create', {
    roomId: id,
    ownerId,
    name: room.name,
    game,
  });
  return room;
}

export function leaveRoom(
  io: AppServer,
  roomId: string,
  socketId: string
): void {
  const s = io.sockets.sockets.get(socketId);
  if (s) void s.leave(roomId);
}

export function updateRoomsList(io: AppServer): void {
  io.emit(EVENTS.ROOMS_LIST, listRooms());
}

export function assignNewOwner(room: BaseRoom): void {
  const nextOwner = room.players[0];
  if (nextOwner) {
    room.ownerId = nextOwner.id;
  }
}

export function removePlayerFromRoom(
  io: AppServer,
  room: BaseRoom,
  socket: AppSocket
): void {
  const idx = room.players.findIndex(p => p.id === socket.id);
  if (idx === -1) return;

  room.players.splice(idx, 1);
  leaveRoom(io, room.id, socket.id);
  const gameModule = getGameModule(room.game);
  gameModule.onPlayerRemoved?.(room, socket.id);
  if (shouldAutowin(room)) {
    gameModule.onPlayerWin?.(io, room, room.players[0]!);
  } else if (shouldDeleteRoom(room, socket.id)) {
    deleteRoom(room.id);
    log(LogLevel.INFO, 'room:deleted', {
      roomId: room.id,
      reason: 'playerLeft',
    });
  } else if (room.ownerId === socket.id) {
    assignNewOwner(room);
  }
  updateRoomsList(io);

  log(LogLevel.INFO, 'room:left', { roomId: room.id, socketId: socket.id });
}

export function removePlayerFromAllRooms(io: AppServer, socket: AppSocket) {
  for (const room of rooms.values()) {
    if (room.players.some(p => p.id === socket.id)) {
      removePlayerFromRoom(io, room, socket);

      io.to(room.id).emit(EVENTS.NOTIFICATION, {
        type: NOTIFICATION_TYPES.PLAYER_LEFT,
        data: socket.data.player.name,
      });
    }
  }
}

export function getActiveRoom(playerId: string): BaseRoom | null {
  for (const room of rooms.values()) {
    if (room.players.some(p => p.id === playerId)) return room;
  }
  return null;
}

export function reassignPlayerInRooms(
  oldSocketId: string,
  newSocket: AppSocket
): void {
  for (const room of rooms.values()) {
    const player = room.players.find(p => p.id === oldSocketId);
    if (player) {
      player.id = newSocket.id;
      if (room.ownerId === oldSocketId) {
        room.ownerId = newSocket.id;
      }
      room.players = room.players.map(p =>
        p.id === oldSocketId ? { ...p, id: newSocket.id } : p
      );
      getGameModule(room.game).onPlayerReconnected?.(
        room,
        oldSocketId,
        newSocket.id
      );

      void newSocket.join(room.id);

      log(LogLevel.INFO, 'room:player-reassigned', {
        roomId: room.id,
        oldSocketId,
        newSocketId: newSocket.id,
      });
    }
  }
}
