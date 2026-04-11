import {
  GAME_RULES,
  ROOM_STATES,
  EVENTS,
  NOTIFICATION_TYPES,
} from '@shared/constants';

import { TURN_START_INDEX } from '../../constants';
import { log } from '../../services/logger';
import { uuid } from '../../utils/uuid';
import { removePlayerFromOrder } from '../game/game.service';

import { generateRoomName, shouldDeleteRoom } from './room.helpers';

import type { Room } from '@shared/types';
import type { Server, Socket } from 'socket.io';

const rooms: Map<string, Room> = new Map();

export function getRoomById(roomId: string): Room | null {
  return rooms.get(roomId) || null;
}

export function listRooms(): Room[] {
  return Array.from(rooms.values());
}

export function deleteRoom(roomId: string): void {
  if (rooms.delete(roomId)) {
    log('info', 'room:delete', { roomId });
  }
}

export function createRoom({ ownerId }: { ownerId: string }): Room {
  const id = uuid();
  const room: Room = {
    id,
    name: generateRoomName(rooms),
    ownerId,
    state: ROOM_STATES.IDLE,
    players: [],
    rules: Object.values(GAME_RULES).reduce(
      (acc, rule) => {
        acc[rule] = false;
        return acc;
      },
      {} as Record<GAME_RULES, boolean>
    ),
    order: [],
    turn: TURN_START_INDEX,
  };
  rooms.set(id, room);
  log('info', 'room:create', { roomId: id, ownerId, name: room.name });
  return room;
}

export function leaveRoom(io: Server, roomId: string, socketId: string): void {
  const s = io.sockets.sockets.get(socketId);
  if (s) s.leave(roomId);
}

export function updateRoomsList(io: Server): void {
  io.emit(EVENTS.ROOMS_LIST, listRooms());
}

export function assignNewOwner(room: Room): void {
  const nextOwner = room.players[0];
  if (nextOwner) {
    room.ownerId = nextOwner.id;
  }
}

export function removePlayerFromRoom(
  io: Server,
  room: Room,
  socket: Socket
): void {
  const idx = room.players.findIndex(p => p.id === socket.id);
  if (idx === -1) return;

  room.players.splice(idx, 1);
  leaveRoom(io, room.id, socket.id);
  removePlayerFromOrder(room, socket.id);
  if (shouldDeleteRoom(room, socket.id)) {
    deleteRoom(room.id);
    log('info', 'room:deleted', { roomId: room.id, reason: 'playerLeft' });
  } else if (room.ownerId === socket.id) {
    assignNewOwner(room);
  }
  updateRoomsList(io);

  log('info', 'room:left', { roomId: room.id, socketId: socket.id });
}

export function removePlayerFromAllRooms(io: Server, socket: Socket) {
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
