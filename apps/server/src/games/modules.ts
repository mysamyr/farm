import type { GameId, Player, Room } from '@game/shared/types';
import type {
  Room as ArenaRoom,
  Player as ArenaPlayer,
} from '@game/shared/types/arena';
import type {
  Room as FarmRoom,
  Player as FarmPlayer,
} from '@game/shared/types/farm';

import type { AppServer } from '../types';

import * as arena from './arena/service';
import * as farm from './farm/service';

export type GameModule<
  TRoom extends Room = Room,
  TPlayer extends Player = Player,
> = {
  addRoomFields: () => Pick<TRoom, 'rules'> & Partial<TRoom>;
  onPlayerRemoved?: (room: TRoom, playerId: string) => void;
  onPlayerReconnected?: (
    room: TRoom,
    oldPlayerId: string,
    newPlayerId: string
  ) => void;
  onPlayerWin?: (io: AppServer, room: TRoom, player: TPlayer) => void;
  onGameStart?: (io: AppServer, room: TRoom) => void;
};

function defineGameModule<TRoom extends Room, TPlayer extends Player = Player>(
  module: GameModule<TRoom, TPlayer>
): GameModule {
  return module as unknown as GameModule;
}

const gameModules: Record<GameId, GameModule> = {
  farm: defineGameModule<FarmRoom, FarmPlayer>({
    addRoomFields: farm.addRoomFields,
    onPlayerRemoved: (room, playerId) => {
      farm.removePlayerFromOrder(room, playerId);
    },
    onPlayerReconnected: (room, oldPlayerId, newPlayerId) => {
      farm.updateRoomOrderId(room, oldPlayerId, newPlayerId);
    },
    onPlayerWin: (io, room, player) => {
      farm.winnerHandler(io, room, player);
    },
    onGameStart: (io, room) => {
      farm.initGameState(io, room);
    },
  }),
  arena: defineGameModule<ArenaRoom, ArenaPlayer>({
    addRoomFields: arena.addRoomFields,
    onPlayerRemoved: (room, playerId) => {
      arena.removePlayerFromOrder(room, playerId);
    },
    onPlayerReconnected: (room, oldPlayerId, newPlayerId) => {
      arena.updateRoomOrderId(room, oldPlayerId, newPlayerId);
    },
    onPlayerWin: (io, room, player) => {
      arena.winnerHandler(io, room, player);
    },
    onGameStart: (io, room) => {
      arena.initGameState(io, room);
    },
  }),
};

export function getGameModule(game: GameId): GameModule {
  return gameModules[game];
}
