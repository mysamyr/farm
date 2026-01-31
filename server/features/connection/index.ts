import { ROOM_STATES } from '../../constants';
import { log } from '../../services/logger';
import {
  getActiveRoom,
  removePlayerFromAllRooms,
  updateRoomsList,
} from '../room/room.service';

import { assignPlayer } from './connection.service';

import type { Server, Socket } from 'socket.io';

const pendingDisconnects = new Map<string, { timeout: NodeJS.Timeout }>();

export function registerConnection(io: Server): void {
  io.on('connection', (socket: Socket): void => {
    const ip =
      (socket.handshake.headers['x-forwarded-for'] as string) ||
      socket.handshake.address ||
      '';
    log('info', 'socket:connected', {
      socketId: socket.id,
      ip,
    });

    const pending = pendingDisconnects.get(socket.id);
    if (pending) {
      clearTimeout(pending.timeout);
      pendingDisconnects.delete(socket.id);
      return;
    }

    assignPlayer(socket);
    updateRoomsList(io);

    socket.on('disconnect', (): void => {
      log('info', 'socket:disconnected', { socketId: socket.id });
      const room = getActiveRoom(socket.id);

      if (room?.state === ROOM_STATES.RUNNING) {
        const timeout = setTimeout((): void => {
          log('info', 'socket:grace-expired', { socketId: socket.id, ip });
          removePlayerFromAllRooms(io, socket);
          pendingDisconnects.delete(socket.id);
        }, 5000);
        pendingDisconnects.set(socket.id, { timeout });
        return;
      }

      removePlayerFromAllRooms(io, socket);
    });
  });
}
