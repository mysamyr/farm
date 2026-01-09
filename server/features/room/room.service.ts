import {
  GAME_RULES,
  ROOM_STATES,
  TURN_START_INDEX,
  EVENTS,
} from '../../constants';
import { log } from '../../services/logger';
import { uuid } from '../../utils/uuid';
import { removePlayerFromOrder } from '../game/game.service';

import { serializeRoom, shouldDeleteRoom } from './room.helpers';

import type { Room } from './room.types';
import type { Player } from '../player/player.types';
import type { Server, Socket } from 'socket.io';

const rooms: Map<string, Room> = new Map();

export function getRoomById(roomId: string): Room | null {
  return rooms.get(roomId) || null;
}

export function listRooms(): Room[] {
  return Array.from(rooms.values());
}

export function deleteRoom(roomId: string): void {
  const existed = rooms.delete(roomId);
  if (existed) {
    log('info', 'room:delete', { roomId });
  }
}

export function createRoom({
  name,
  ownerId,
}: {
  name?: string;
  ownerId: string;
}): Room {
  const id = uuid();
  const roomName = name || `Room-${id.substring(0, 6)}`;
  const room: Room = {
    id,
    name: roomName,
    ownerId,
    state: ROOM_STATES.IDLE,
    players: new Map<string, Player>(),
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
  log('info', 'room:create', { roomId: id, ownerId, name: roomName });
  return room;
}

export function leaveRoom(io: Server, roomId: string, socketId: string): void {
  const s = io.sockets.sockets.get(socketId);
  if (s) s.leave(roomId);
}

export function updateRoomsList(io: Server): void {
  io.emit(EVENTS.ROOMS_LIST, listRooms().map(serializeRoom));
}

export function assignNewOwner(room: Room): void {
  const nextOwner = room.players.values().next().value;
  if (nextOwner) {
    room.ownerId = nextOwner.id;
  }
}

export function removePlayerFromRoom(
  io: Server,
  room: Room,
  socket: Socket
): void {
  if (!room.players.has(socket.id)) return;

  room.players.delete(socket.id);
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
    if (room.players.has(socket.id)) {
      removePlayerFromRoom(io, room, socket);
    }
  }
}
