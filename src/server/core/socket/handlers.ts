import { registerGameFeature } from '../../games/farm';
import { registerConnection } from '../features/connection';
import { registerPlayerFeature } from '../features/player';
import { registerRoomFeature } from '../features/room';

import type { Server } from 'socket.io';

export function registerSocketHandlers(io: Server): void {
  registerConnection(io);
  registerRoomFeature(io);
  registerPlayerFeature(io);

  registerGameFeature(io);
}
