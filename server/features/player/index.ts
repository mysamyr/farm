import { log } from '../../services/logger';
import { updateRoomsList } from '../room/room.service';

import type { RenamePlayerReq } from './player.types';
import type { AckFunc } from '../../types';
import type { Server, Socket } from 'socket.io';

const renamePlayerHandler =
  (io: Server, socket: Socket) =>
  (payload: RenamePlayerReq, ack?: AckFunc): void => {
    log('debug', 'event:player:rename', {
      socketId: socket.id,
      name: payload.name,
    });

    if (payload.name) {
      socket.data.player.name = payload.name;
      updateRoomsList(io);
    }
    if (ack) ack({ ok: true });
  };

export function registerPlayerFeature(io: Server): void {
  io.on('connection', (socket: Socket): void => {
    socket.on('player:rename', renamePlayerHandler(io, socket));
  });
}
