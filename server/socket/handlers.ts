import { registerConnection } from '../features/connection';
import { registerGameFeature } from '../features/game';
import { registerPlayerFeature } from '../features/player';
import { registerRoomFeature } from '../features/room';

import type { Server } from 'socket.io';

export function registerSocketHandlers(io: Server): void {
  registerConnection(io);
  registerRoomFeature(io);
  registerGameFeature(io);
  registerPlayerFeature(io);
}
