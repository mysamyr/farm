import { EVENTS } from '@game/shared/constants';

import type { Server } from 'socket.io';

import { LogLevel } from '../../constants';
import { log } from '../../services/logger';
import type { AckFunc, AppSocket } from '../../types';
import { updateRoomsList } from '../room/room.service';

import type { RenamePlayerReq } from './player.types';

const renamePlayerHandler =
  (io: Server, socket: AppSocket) =>
  (payload: RenamePlayerReq, ack?: AckFunc): void => {
    log(LogLevel.DEBUG, 'event:player:rename', {
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
  io.on(EVENTS.CONNECTION, (socket: AppSocket): void => {
    socket.on(EVENTS.PLAYER_RENAME, renamePlayerHandler(io, socket));
  });
}
