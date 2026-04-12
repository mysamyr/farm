import type { GameId, Room } from '@game/shared/types';
import type { Room as FarmRoom } from '@game/shared/types/farm';

import { addRoomFields, removePlayerFromOrder } from './farm/service';

export type GameModule<TRoom extends Room = Room> = {
  addRoomFields: () => Pick<TRoom, 'rules'> & Partial<TRoom>;
  onPlayerRemoved?: {
    bivarianceHack(room: TRoom, playerId: string): void;
  }['bivarianceHack'];
};

const gameModules: Record<GameId, GameModule> = {
  farm: {
    addRoomFields,
    onPlayerRemoved: (room, playerId) => {
      removePlayerFromOrder(room, playerId);
    },
  } satisfies GameModule<FarmRoom>,
};

export function getGameModule(game: GameId): GameModule {
  return gameModules[game];
}
