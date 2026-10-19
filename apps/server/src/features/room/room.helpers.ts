import { ROOM_STATES } from '@game/shared/constants';

import type { BaseRoom } from '@game/shared/types';

import { gameRegistry } from '../../games/registry.js';

export function canStartGame(room: BaseRoom): boolean {
  const config = gameRegistry.getConfig(room.game);
  const count = room.players.length;
  return (
    count >= config.minPlayers &&
    count <= config.maxPlayers &&
    room.state === ROOM_STATES.IDLE
  );
}

export function shouldDeleteRoom(room: BaseRoom, socketId: string): boolean {
  return (
    !room.players.length ||
    (room.state === ROOM_STATES.IDLE && room.ownerId === socketId)
  );
}

export function shouldAutowin(room: BaseRoom): boolean {
  const minPlayers = gameRegistry.getConfig(room.game).minPlayers;
  return (
    room.state === ROOM_STATES.RUNNING &&
    room.players.length > 0 &&
    room.players.length < minPlayers
  );
}
