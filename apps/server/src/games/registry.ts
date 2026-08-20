import { GameId } from '@game/shared/constants';
import type { GameHandlerContext } from '@game/shared/engine';
import type {
  BasePlayer,
  BaseRoom,
  GameActionPayload,
  GameMetadata,
  SocketAck,
} from '@game/shared/types';

import type { AppServer } from '../types/index.js';

/**
 * Server-side game module interface.
 * Extends the shared GameModule with server-specific lifecycle hooks.
 */
export interface ServerGameModule<
  TRoom extends BaseRoom = BaseRoom,
  TPlayer extends BasePlayer = BasePlayer,
> {
  /** Unique game identifier */
  readonly gameId: GameId;

  /** Game configuration */
  readonly config: {
    minPlayers: number;
    maxPlayers: number;
  };

  /** Game display metadata for client */
  readonly metadata: GameMetadata;

  /** Additional validation before game can start */
  canStartGame?: (room: TRoom) => boolean;

  /** Initialize room-specific fields when creating a room */
  addRoomFields: () => Pick<TRoom, 'rules'> & Partial<TRoom>;

  /** Handle player removal from room */
  onPlayerRemoved?: (room: TRoom, playerId: string) => void;

  /** Handle player reconnection with new socket ID */
  onPlayerReconnected?: (
    room: TRoom,
    oldPlayerId: string,
    newPlayerId: string
  ) => void;

  /** Handle player win condition */
  onPlayerWin?: (io: AppServer, room: TRoom, player: TPlayer) => void;

  /** Initialize game state when game starts */
  onGameStart?: (io: AppServer, room: TRoom) => void;

  /** Handle a game action payload */
  handleAction?: (
    ctx: GameHandlerContext,
    payload: GameActionPayload,
    ack?: (response: SocketAck) => void
  ) => void;
}

/**
 * Registry for managing game modules.
 * Provides centralized access to game-specific logic.
 */
class GameRegistry {
  private modules = new Map<GameId, ServerGameModule>();

  /**
   * Register a game module.
   */
  register<TRoom extends BaseRoom, TPlayer extends BasePlayer>(
    module: ServerGameModule<TRoom, TPlayer>
  ): void {
    this.modules.set(module.gameId, module as unknown as ServerGameModule);
  }

  /**
   * Get a registered game module.
   * @throws Error if game is not registered
   */
  get(gameId: GameId): ServerGameModule {
    const module = this.modules.get(gameId);
    if (!module) {
      throw new Error(`Game "${gameId}" is not registered`);
    }
    return module;
  }

  /**
   * Check if a game is registered.
   */
  has(gameId: GameId): boolean {
    return this.modules.has(gameId);
  }

  /**
   * Get all registered game IDs.
   */
  getRegisteredGames(): GameId[] {
    return Array.from(this.modules.keys());
  }

  /**
   * Get all registered game modules.
   */
  getAll(): ServerGameModule[] {
    return Array.from(this.modules.values());
  }

  /**
   * Get game configuration.
   */
  getConfig(gameId: GameId): ServerGameModule['config'] {
    return this.get(gameId).config;
  }

  /**
   * Get all game metadata for client consumption.
   */
  getAllMetadata(): GameMetadata[] {
    return Array.from(this.modules.values()).map(module => module.metadata);
  }
}

export const gameRegistry = new GameRegistry();
