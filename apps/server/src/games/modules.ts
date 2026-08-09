import * as arena from '@game/game-arena/server';
import {
  DEFAULT_CONFIG as ARENA_CONFIG,
  GAME_METADATA as ARENA_METADATA,
  type Player as ArenaPlayer,
  type Room as ArenaRoom,
} from '@game/game-arena/shared';
import * as farm from '@game/game-farm/server';
import {
  DEFAULT_CONFIG as FARM_CONFIG,
  GAME_METADATA as FARM_METADATA,
  type Player as FarmPlayer,
  type Room as FarmRoom,
} from '@game/game-farm/shared';
import { EVENTS, NOTIFICATION_TYPES } from '@game/shared/constants';
import type { BasePlayer, BaseRoom } from '@game/shared/types';

import { LogLevel } from '../constants/index.js';
import { log } from '../services/logger.js';
import type { AppServer } from '../types/index.js';

import { gameRegistry, type ServerGameModule } from './registry.js';

/**
 * Define a type-safe game module.
 */
function defineGameModule<
  TRoom extends BaseRoom,
  TPlayer extends BasePlayer = BasePlayer,
>(module: ServerGameModule<TRoom, TPlayer>): ServerGameModule<TRoom, TPlayer> {
  return module;
}

function createWinnerHandler<
  TRoom extends BaseRoom,
  TPlayer extends BasePlayer,
>(markWinner: (room: TRoom, player: TPlayer) => void) {
  return (io: AppServer, room: TRoom, player: TPlayer): void => {
    markWinner(room, player);

    log(LogLevel.INFO, 'game:finished', {
      roomId: room.id,
      winnerId: player.id,
      winnerName: player.name,
    });

    io.to(room.id).emit(EVENTS.NOTIFICATION, {
      type: NOTIFICATION_TYPES.GAME_FINISHED,
      data: player.name,
    });
  };
}

// Register Farm game module
gameRegistry.register(
  defineGameModule<FarmRoom, FarmPlayer>({
    gameId: 'farm',
    config: {
      minPlayers: FARM_CONFIG.minPlayers,
      maxPlayers: FARM_CONFIG.maxPlayers,
    },
    metadata: FARM_METADATA,
    addRoomFields: farm.addRoomFields,
    onPlayerRemoved: (room, playerId) => {
      farm.removePlayerFromOrder(room, playerId);
    },
    onPlayerReconnected: (room, oldPlayerId, newPlayerId) => {
      farm.updateRoomOrderId(room, oldPlayerId, newPlayerId);
    },
    onPlayerWin: createWinnerHandler<FarmRoom, FarmPlayer>(farm.markWinner),
    onGameStart: (_io, room) => {
      farm.initGameState(room);
    },
    registerHandlers: farm.registerHandlers,
  })
);

// Register Arena game module
gameRegistry.register(
  defineGameModule<ArenaRoom, ArenaPlayer>({
    gameId: 'arena',
    metadata: ARENA_METADATA,
    config: {
      minPlayers: ARENA_CONFIG.minPlayers,
      maxPlayers: ARENA_CONFIG.maxPlayers,
    },
    canStartGame: room => {
      return arena.canStartArenaGame(room);
    },
    addRoomFields: arena.addRoomFields,
    onPlayerRemoved: (room, playerId) => {
      arena.removePlayerFromOrder(room, playerId);
    },
    onPlayerReconnected: (room, oldPlayerId, newPlayerId) => {
      arena.updateRoomOrderId(room, oldPlayerId, newPlayerId);
    },
    onPlayerWin: createWinnerHandler<ArenaRoom, ArenaPlayer>(arena.markWinner),
    onGameStart: (_io, room) => {
      arena.initGameState(room);
    },
    registerHandlers: arena.registerHandlers,
  })
);
