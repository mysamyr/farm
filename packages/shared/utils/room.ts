import type { BaseRoom, RoomRole } from '../types/index.js';

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
