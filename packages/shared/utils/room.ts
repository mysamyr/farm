import { VALIDATION } from '../constants/index.js';
import type { BaseRoom, RoomRole } from '../types/index.js';

/** Passwords are not trimmed: spaces and any other characters count. */
export function isValidRoomPassword(password: unknown): password is string {
  if (typeof password !== 'string') return false;
  const length = [...password].length;
  return (
    length >= VALIDATION.ROOM_PASSWORD.MIN_LENGTH &&
    length <= VALIDATION.ROOM_PASSWORD.MAX_LENGTH
  );
}

export function getRoomRole(
  room: BaseRoom | null | undefined,
  socketId: string | null | undefined
): RoomRole | null {
  if (!room || !socketId) return null;
  if (room.players.some(player => player.id === socketId)) return 'player';
  if (room.spectators.some(spectator => spectator.id === socketId)) {
    return 'spectator';
  }
  return null;
}

export function isRoomMember(
  room: BaseRoom,
  socketId: string | null | undefined
): boolean {
  return getRoomRole(room, socketId) !== null;
}
