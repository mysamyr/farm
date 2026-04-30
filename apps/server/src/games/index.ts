import type { GameId, Player, Room } from '@game/shared/types';
import type {
  Room as FarmRoom,
  Player as FarmPlayer,
} from '@game/shared/types/farm';

import { AppServer } from '../types';

import {
  addRoomFields,
  removePlayerFromOrder,
  updateRoomOrderId,
  winnerHandler,
  initGameState,
} from './farm/service';

export type GameModule<
  TRoom extends Room = Room,
  TPlayer extends Player = Player,
> = {
  addRoomFields: () => Pick<TRoom, 'rules'> & Partial<TRoom>;
  onPlayerRemoved?: {
    bivarianceHack(room: TRoom, playerId: string): void;
  }['bivarianceHack'];
  onPlayerReconnected?: {
    bivarianceHack(room: TRoom, oldPlayerId: string, newPlayerId: string): void;
  }['bivarianceHack'];
  onPlayerWin?: {
    bivarianceHack(io: AppServer, room: TRoom, player: TPlayer): void;
  }['bivarianceHack'];
  onGameStart?: {
    bivarianceHack(io: AppServer, room: TRoom): void;
  }['bivarianceHack'];
};

const gameModules: Record<GameId, GameModule> = {
  farm: {
    addRoomFields,
    onPlayerRemoved: (room, playerId) => {
      removePlayerFromOrder(room, playerId);
    },
    onPlayerReconnected: (room, oldPlayerId, newPlayerId) => {
      updateRoomOrderId(room, oldPlayerId, newPlayerId);
    },
    onPlayerWin: (io, room, player) => {
      winnerHandler(io, room, player);
    },
    onGameStart: (io, room) => {
      initGameState(io, room);
    },
  } satisfies GameModule<FarmRoom, FarmPlayer>,
};

export function getGameModule(game: GameId): GameModule {
  return gameModules[game];
}
