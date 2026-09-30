import { EVENTS } from '@game/shared/constants';

import { registerChatFeature } from '../features/chat/index.js';
import { registerConnection } from '../features/connection/index.js';
import { registerPlayerFeature } from '../features/player/index.js';
import { registerRoomFeature } from '../features/room/index.js';
import { registerAllGameFeatures } from '../games/index.js';

import type { AppServer, AppSocket } from '../types/index.js';

export function registerSocketHandlers(io: AppServer): void {
  io.on(EVENTS.CONNECTION, (socket: AppSocket) => {
    registerConnection(io, socket);
    registerRoomFeature(io, socket);
    registerPlayerFeature(io, socket);
    registerChatFeature(io, socket);

    registerAllGameFeatures(io, socket);
  });
}
