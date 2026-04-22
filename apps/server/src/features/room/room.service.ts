import {
  ROOM_STATES,
  EVENTS,
  NOTIFICATION_TYPES,
} from '@game/shared/constants';

import type { Room } from '@game/shared/types';
import type { Room as FarmRoom } from '@game/shared/types/farm';

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

const rooms: Map<string, Room> = new Map();

export function getRoomById(roomId: string): Room | null {
  return rooms.get(roomId) || null;
}

export function listRooms(): Room[] {
  return Array.from(rooms.values());
}

export function deleteRoom(roomId: string): void {
  if (rooms.delete(roomId)) {
    log(LogLevel.INFO, 'room:delete', { roomId });
  }
}

export function createRoom(ownerId: string): Room {
  const id = uuid();
  const game: Room['game'] = 'farm';
  const roomFields = getGameModule(game).addRoomFields();
  const room: Room = {
    id,
    name: generateRoomName(rooms),
    ownerId,
    game,
    state: ROOM_STATES.IDLE,
    players: [],
    ...roomFields,
    rules: roomFields.rules,
  };
  rooms.set(id, room);
  log(LogLevel.INFO, 'room:create', { roomId: id, ownerId, name: room.name });
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
  io.emit(EVENTS.ROOMS_LIST, listRooms() as FarmRoom[]);
}

export function assignNewOwner(room: Room): void {
  const nextOwner = room.players[0];
  if (nextOwner) {
    room.ownerId = nextOwner.id;
  }
}

export function removePlayerFromRoom(
  io: AppServer,
  room: Room,
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

export function getActiveRoom(playerId: string): Room | null {
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
