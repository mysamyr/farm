import { DEFAULT_CONFIG, ROOM_STATES } from '@shared/constants';

import type { Room } from '@shared/types';

export function canStartGame(room: Room): boolean {
  const count = room.players.length;
  return (
    count >= DEFAULT_CONFIG.minPlayers &&
    count <= DEFAULT_CONFIG.maxPlayers &&
    room.state === ROOM_STATES.IDLE
  );
}

export function shouldDeleteRoom(room: Room, socketId: string): boolean {
  return (
    (room.state === ROOM_STATES.RUNNING && room.players.length < 2) ||
    (room.state === ROOM_STATES.IDLE && room.ownerId === socketId) ||
    (room.state === ROOM_STATES.FINISHED && !room.players.length)
  );
}

export function generateRoomName(rooms: Map<string, Room>): string {
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
