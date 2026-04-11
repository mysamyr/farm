import { EVENTS, ROOM_STATES } from '@shared/constants';

import { LogLevel } from '../../../constants';
import { log } from '../../services/logger';
import {
  getActiveRoom,
  removePlayerFromAllRooms,
  updateRoomsList,
} from '../room/room.service';

import { getIpAddress } from './connection.helper';
import {
  assignPlayer,
  getPendingDisconnect,
  gracefulDisconnect,
  reconnect,
} from './connection.service';

import type { DisconnectReason, Server, Socket } from 'socket.io';

const disconnectHandler =
  (io: Server, socket: Socket, ip: string) =>
  (reason: DisconnectReason): void => {
    log(LogLevel.INFO, 'socket:disconnected', { socketId: socket.id, reason });
    const room = getActiveRoom(socket.id);

    if (room && room.state === ROOM_STATES.RUNNING) {
      gracefulDisconnect(io, socket, ip);
      return;
    }

    removePlayerFromAllRooms(io, socket);
  };

export function registerConnection(io: Server): void {
  io.on(EVENTS.CONNECTION, (socket: Socket): void => {
    const ip = getIpAddress(socket);
    log(LogLevel.INFO, 'socket:connected', {
      socketId: socket.id,
      ip,
    });

    const pending = getPendingDisconnect(socket);
    if (pending) {
      reconnect(socket, pending);
      return;
    }

    assignPlayer(socket);
    updateRoomsList(io);

    socket.on(EVENTS.DISCONNECT, disconnectHandler(io, socket, ip));
  });
}
