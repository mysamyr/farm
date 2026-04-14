import { EVENTS } from '@game/shared/constants';

import { LogLevel } from '../../constants';
import { log } from '../../services/logger';
import type { AckFunc, AppServer, AppSocket } from '../../types';
import { updateRoomsList } from '../room/room.service';

import type { RenamePlayerReq } from './player.types';

const renamePlayerHandler =
  (io: AppServer, socket: AppSocket) =>
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

export function registerPlayerFeature(io: AppServer): void {
  io.on(EVENTS.CONNECTION, (socket: AppSocket): void => {
    socket.on(EVENTS.PLAYER_RENAME, renamePlayerHandler(io, socket));
  });
}
