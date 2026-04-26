import { EVENTS } from '@game/shared/constants';

import { registerConnection } from '../features/connection';
import { registerPlayerFeature } from '../features/player';
import { registerRoomFeature } from '../features/room';
import { registerGameFeature } from '../games/farm';

import type { AppServer, AppSocket } from '../types';

export function registerSocketHandlers(io: AppServer): void {
  io.on(EVENTS.CONNECTION, (socket: AppSocket) => {
    registerConnection(io, socket);
    registerRoomFeature(io, socket);
    registerPlayerFeature(io, socket);

    registerGameFeature(io, socket);
  });
}
