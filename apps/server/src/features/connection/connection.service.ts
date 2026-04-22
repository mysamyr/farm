import { EVENTS } from '@game/shared/constants';
import type { Player } from '@game/shared/types';

import { LogLevel } from '../../constants';
import { log } from '../../services/logger';
import type { AppServer, AppSocket } from '../../types';
import { getDefaultPlayerName } from '../player/player.helpers';
import {
  reassignPlayerInRooms,
  removePlayerFromAllRooms,
} from '../room/room.service';

const GRACE_PERIOD_MS = 30 * 1000;

export type PendingDisconnect = {
  timeout: NodeJS.Timeout;
  oldSocketId: string;
  player: Player;
};

const pendingDisconnects = new Map<string, PendingDisconnect>();

export function getPendingDisconnect(
  userId: string
): PendingDisconnect | undefined {
  return pendingDisconnects.get(userId);
}

export function reconnect(
  userId: string,
  newSocket: AppSocket,
  pending: PendingDisconnect
): void {
  clearTimeout(pending.timeout);
  pendingDisconnects.delete(userId);
  newSocket.data.player = { id: newSocket.id, name: pending.player.name };
  newSocket.data.userId = userId;
  if (pending.oldSocketId !== newSocket.id) {
    reassignPlayerInRooms(pending.oldSocketId, newSocket);
  }
}

export function gracefulDisconnect(
  io: AppServer,
  socket: AppSocket,
  userId: string,
  ip: string
): void {
  const player = { ...socket.data.player };
  const timeout = setTimeout((): void => {
    log(LogLevel.INFO, 'socket:grace-expired', {
      socketId: socket.id,
      userId,
      ip,
    });
    removePlayerFromAllRooms(io, socket);
    pendingDisconnects.delete(userId);
    broadcastOnlineCount(io);
  }, GRACE_PERIOD_MS);

  pendingDisconnects.set(userId, { timeout, oldSocketId: socket.id, player });
}

export function assignPlayer(socket: AppSocket): void {
  socket.data.player = {
    id: socket.id,
    name: getDefaultPlayerName(socket),
  };
}

export function broadcastOnlineCount(io: AppServer): void {
  const count = io.engine.clientsCount;
  io.emit(EVENTS.ONLINE_COUNT, count);
}
