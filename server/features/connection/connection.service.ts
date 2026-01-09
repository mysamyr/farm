import { getDefaultPlayerName } from './connection.helper';

import type { Socket } from 'socket.io';

export function assignPlayer(socket: Socket): void {
  socket.data.player = {
    id: socket.id,
    name: getDefaultPlayerName(socket),
  };
}
