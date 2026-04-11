import type { Room } from '@shared/types';
import type { Socket } from 'socket.io';

export function getDefaultPlayerName(socket: Socket): string {
  return 'Player-' + socket.id.substring(0, 4);
}

export function checkIfPlayerAlreadyInRoom(
  room: Room,
  socket: Socket
): boolean {
  for (const player of room.players) {
    if (player.name === socket.data.player.name) {
      return true;
    }
  }
  return false;
}
