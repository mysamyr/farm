import { EVENTS, VALIDATION, ERROR } from '@game/shared/constants';

import { PlayerRenamePayload } from '@game/shared/types';

import { LogLevel } from '../../constants';
import { log } from '../../services/logger';
import type { AckFunc, AppServer, AppSocket } from '../../types';
import { updateRoomsList } from '../room/room.service';

const renamePlayerHandler =
  (io: AppServer, socket: AppSocket) =>
  (payload: PlayerRenamePayload, ack?: AckFunc): void => {
    log(LogLevel.DEBUG, 'event:player:rename', {
      socketId: socket.id,
      name: payload.name,
    });

    const nameChars = [...(payload.name ?? '')];
    if (
      nameChars.length < VALIDATION.USER_NAME.MIN_LENGTH ||
      nameChars.length > VALIDATION.USER_NAME.MAX_LENGTH
    ) {
      if (ack) ack({ ok: false, error: ERROR.INVALID_PLAYER_NAME_LENGTH });
      return;
    }

    if (payload.name) {
      socket.data.player.name = payload.name;
      updateRoomsList(io);
    }
    if (ack) ack({ ok: true });
  };

export function registerPlayerFeature(io: AppServer, socket: AppSocket): void {
  socket.on(EVENTS.PLAYER_RENAME, renamePlayerHandler(io, socket));
}
