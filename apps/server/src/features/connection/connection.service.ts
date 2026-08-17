import { EVENTS } from '@game/shared/constants';

import { LogLevel } from '../../constants/index.js';
import { log } from '../../services/logger.js';
import type { AppServer, AppSocket } from '../../types/index.js';
import { getDefaultPlayerName } from '../player/player.helpers.js';
import {
  reassignPlayerInRooms,
  removePlayerFromAllRooms,
} from '../room/room.service.js';

import {
  removePendingDisconnect,
  setPendingDisconnect,
  type PendingDisconnect,
} from './connection.store.js';

const GRACE_PERIOD_MS = 30 * 1000;

export type { PendingDisconnect } from './connection.store.js';
export { getPendingDisconnect } from './connection.store.js';

export function reconnect(
  userId: string,
  newSocket: AppSocket,
  pending: PendingDisconnect
): void {
  clearTimeout(pending.timeout);
  removePendingDisconnect(userId);
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
    removePendingDisconnect(userId);
    broadcastOnlineCount(io);
  }, GRACE_PERIOD_MS);

  setPendingDisconnect(userId, { timeout, oldSocketId: socket.id, player });
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
