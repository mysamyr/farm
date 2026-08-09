import { EVENTS, ROOM_STATES } from '@game/shared/constants';

import type { DisconnectReason } from 'socket.io';

import { LogLevel } from '../../constants/index.js';
import { log } from '../../services/logger.js';
import type { AppServer, AppSocket } from '../../types/index.js';
import {
  getActiveRoom,
  removePlayerFromAllRooms,
  updateRoomsList,
} from '../room/room.service.js';

import { getIpAddress } from './connection.helper.js';
import {
  assignPlayer,
  broadcastOnlineCount,
  getPendingDisconnect,
  gracefulDisconnect,
  PendingDisconnect,
  reconnect,
} from './connection.service.js';

const disconnectHandler =
  (io: AppServer, socket: AppSocket, ip: string) =>
  (reason: DisconnectReason): void => {
    log(LogLevel.INFO, 'socket:disconnected', { socketId: socket.id, reason });
    const room = getActiveRoom(socket.id);

    if (room && room.state === ROOM_STATES.RUNNING) {
      const userId = socket.data.userId;
      if (userId) {
        gracefulDisconnect(io, socket, userId, ip);
        return;
      }
    }

    removePlayerFromAllRooms(io, socket);
    broadcastOnlineCount(io);
  };

const reconnectHandler = (
  io: AppServer,
  socket: AppSocket,
  ip: string,
  pending: PendingDisconnect,
  userId: string
) => {
  log(LogLevel.INFO, 'socket:reconnected', {
    socketId: socket.id,
    userId,
    oldSocketId: pending.oldSocketId,
  });

  reconnect(userId, socket, pending);
  broadcastOnlineCount(io);
  updateRoomsList(io);

  socket.on(EVENTS.DISCONNECT, disconnectHandler(io, socket, ip));
};

export function registerConnection(io: AppServer, socket: AppSocket): void {
  const ip = getIpAddress(socket);
  const userId = (socket.handshake.auth as { userId?: string }).userId;

  log(LogLevel.INFO, 'socket:connected', { socketId: socket.id, ip });

  if (userId) {
    const pending = getPendingDisconnect(userId);
    if (pending) {
      reconnectHandler(io, socket, ip, pending, userId);
      return;
    }
    socket.data.userId = userId;
  }

  assignPlayer(socket);
  broadcastOnlineCount(io);
  updateRoomsList(io);

  socket.on(EVENTS.DISCONNECT, disconnectHandler(io, socket, ip));
}
