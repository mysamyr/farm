import type { GameId } from '@game/shared/types';

import type { AppServer, AppSocket } from '../types';

import { registerGameFeature as registerArenaFeature } from './arena';
import { registerGameFeature as registerFarmFeature } from './farm';

export type { GameModule } from './modules';
export { getGameModule } from './modules';

type RegisterHandler = (io: AppServer, socket: AppSocket) => void;

const gameHandlers: Record<GameId, RegisterHandler> = {
  farm: registerFarmFeature,
  arena: registerArenaFeature,
};

export function registerAllGameFeatures(
  io: AppServer,
  socket: AppSocket
): void {
  for (const handler of Object.values(gameHandlers)) {
    handler(io, socket);
  }
}
