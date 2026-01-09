import type { Socket } from 'socket.io';

export function getDefaultPlayerName(socket: Socket): string {
  return 'Player-' + socket.id.substring(0, 4);
}
