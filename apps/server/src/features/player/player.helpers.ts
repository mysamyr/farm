import type { BaseRoom } from '@game/shared/types';

import type { AppSocket } from '../../types/index.js';

export function getDefaultPlayerName(socket: AppSocket): string {
  return 'Player-' + socket.id.substring(0, 4);
}

export function checkIfPlayerAlreadyInRoom(
  room: BaseRoom,
  socket: AppSocket
): boolean {
  for (const player of room.players) {
    if (player.name === socket.data.player.name) {
      return true;
    }
  }
  return false;
}
