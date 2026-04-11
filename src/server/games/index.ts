import { addRoomFields, removePlayerFromOrder } from './farm/service';

import type { GameId, Room } from '@shared/types';
import type { Room as FarmRoom } from '@shared/types/farm';

export type GameModule<TRoom extends Room = Room> = {
  addRoomFields: () => Pick<TRoom, 'rules'> & Partial<TRoom>;
  onPlayerRemoved?: {
    bivarianceHack(room: TRoom, playerId: string): void;
  }['bivarianceHack'];
};

const farmGameModule: GameModule<FarmRoom> = {
  addRoomFields,
  onPlayerRemoved: (room, playerId) => {
    removePlayerFromOrder(room, playerId);
  },
};

const gameModules: Record<GameId, GameModule> = {
  farm: farmGameModule,
};

export function getGameModule(game: GameId): GameModule {
  return gameModules[game];
}
