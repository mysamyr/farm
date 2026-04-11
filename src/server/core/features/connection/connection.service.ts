import { LogLevel } from '../../../constants';
import { log } from '../../services/logger';
import { getDefaultPlayerName } from '../player/player.helpers';
import { removePlayerFromAllRooms } from '../room/room.service';

import type { Server, Socket } from 'socket.io';

type PendingDisconnect = {
  timeout: NodeJS.Timeout;
};

const pendingDisconnects = new Map<string, PendingDisconnect>();

export function getPendingDisconnect(
  socket: Socket
): PendingDisconnect | undefined {
  return pendingDisconnects.get(socket.id);
}

export function reconnect(socket: Socket, pending: PendingDisconnect): void {
  clearTimeout(pending.timeout);
  pendingDisconnects.delete(socket.id);
}

export function gracefulDisconnect(
  io: Server,
  socket: Socket,
  ip: string
): void {
  const timeout = setTimeout((): void => {
    log(LogLevel.INFO, 'socket:grace-expired', { socketId: socket.id, ip });
    removePlayerFromAllRooms(io, socket);
    pendingDisconnects.delete(socket.id);
  }, 10000);

  pendingDisconnects.set(socket.id, { timeout });
}

export function assignPlayer(socket: Socket): void {
  socket.data.player = {
    id: socket.id,
    name: getDefaultPlayerName(socket),
  };
}
