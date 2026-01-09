import type { Room } from '../room/room.types';
import type { Socket } from 'socket.io';

export function checkIfPlayerAlreadyInRoom(
  room: Room,
  socket: Socket
): boolean {
  for (const player of room.players.values()) {
    if (player.name === socket.data.player.name) {
      return true;
    }
  }
  return false;
}
