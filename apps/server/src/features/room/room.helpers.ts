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

export function generateRoomName(rooms: Map<string, BaseRoom>): string {
  const adjectives = [
    'Sunny',
    'Misty',
    'Quiet',
    'Lively',
    'Happy',
    'Sad',
    'Brave',
    'Shy',
    'Clever',
    'Lazy',
  ];
  const nouns = [
    'Meadow',
    'Forest',
    'River',
    'Mountain',
    'Valley',
    'Ocean',
    'Desert',
    'Island',
    'Village',
    'City',
  ];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const name = `${adjective} ${noun}`;
  if (Array.from(rooms.values()).some(room => room.name === name)) {
    return generateRoomName(rooms);
  }
  return name;
}
