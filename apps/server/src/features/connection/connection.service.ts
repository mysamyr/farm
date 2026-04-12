import type { Server } from 'socket.io';

import { LogLevel } from '../../constants';
import { log } from '../../services/logger';
import type { AppSocket } from '../../types';
import { getDefaultPlayerName } from '../player/player.helpers';
import { removePlayerFromAllRooms } from '../room/room.service';

type PendingDisconnect = {
  timeout: NodeJS.Timeout;
};

const pendingDisconnects = new Map<string, PendingDisconnect>();

export function getPendingDisconnect(
  socket: AppSocket
): PendingDisconnect | undefined {
  return pendingDisconnects.get(socket.id);
}

export function reconnect(socket: AppSocket, pending: PendingDisconnect): void {
  clearTimeout(pending.timeout);
  pendingDisconnects.delete(socket.id);
}

export function gracefulDisconnect(
  io: Server,
  socket: AppSocket,
  ip: string
): void {
  const timeout = setTimeout((): void => {
    log(LogLevel.INFO, 'socket:grace-expired', { socketId: socket.id, ip });
    removePlayerFromAllRooms(io, socket);
    pendingDisconnects.delete(socket.id);
  }, 10000);

  pendingDisconnects.set(socket.id, { timeout });
}

export function assignPlayer(socket: AppSocket): void {
  socket.data.player = {
    id: socket.id,
    name: getDefaultPlayerName(socket),
  };
}
