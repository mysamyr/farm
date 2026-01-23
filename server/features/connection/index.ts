import { log } from '../../services/logger';
import {
  removePlayerFromAllRooms,
  updateRoomsList,
} from '../room/room.service';

import { assignPlayer } from './connection.service';

import type { Server, Socket } from 'socket.io';

export function registerConnection(io: Server): void {
  io.on('connection', (socket: Socket): void => {
    log('info', 'socket:connected', {
      socketId: socket.id,
      ip:
        (socket.handshake.headers['x-forwarded-for'] as string) ||
        socket.handshake.address,
    });

    assignPlayer(socket);
    updateRoomsList(io);

    socket.on('disconnect', (): void => {
      log('info', 'socket:disconnected', { socketId: socket.id });
      // TODO: If game is in progress, keep the player in the room (probably disconnect after some time)
      removePlayerFromAllRooms(io, socket);
    });
  });
}
