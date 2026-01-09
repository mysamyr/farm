import { DEFAULT_CONFIG, ROOM_STATES } from '../../constants';

import type { Room } from './room.types';

export function canStartGame(room: Room): boolean {
  const count = room.players.size;
  return (
    count >= DEFAULT_CONFIG.minPlayers &&
    count <= DEFAULT_CONFIG.maxPlayers &&
    room.state === ROOM_STATES.IDLE
  );
}

export function serializeRoom(room: Room) {
  return {
    id: room.id,
    name: room.name,
    ownerId: room.ownerId,
    state: room.state,
    players: Array.from(room.players.values()).map(p => ({
      id: p.id,
      name: p.name,
      animals: p.animals,
      exchangedThisTurn: p.exchangedThisTurn,
    })),
    rules: room.rules,
    order: room.order,
    turn: room.turn,
    dice: room.dice,
    winner: room.winner,
  };
}

export function shouldDeleteRoom(room: Room, socketId: string): boolean {
  return (
    (room.state === ROOM_STATES.RUNNING && room.players.size < 2) ||
    (room.state === ROOM_STATES.IDLE && room.ownerId === socketId) ||
    (room.state === ROOM_STATES.FINISHED && !room.players.size)
  );
}
