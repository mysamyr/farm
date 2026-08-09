import type { GameHandlerContext } from '@game/shared/engine';
import type { BaseRoom } from '@game/shared/types';

import { LogLevel } from '../constants/index.js';
import { getRoomById } from '../features/room/room.store.js';
import { log } from '../services/logger.js';
import type { AppServer, AppSocket } from '../types/index.js';

export { gameRegistry } from './registry.js';

import { gameRegistry } from './registry.js';
import './modules.js';

/**
 * Creates a GameHandlerContext adapter that bridges Socket.io to the
 * game-agnostic GameHandlerContext interface.
 *
 * This adapter uses type assertions to bridge between the strongly-typed
 * Socket.io events and the generic GameHandlerContext interface.
 * The game packages define their own typed handlers internally.
 */
function createHandlerContext(
  io: AppServer,
  socket: AppSocket
): GameHandlerContext {
  return {
    socketId: socket.id,

    on<TPayload, TAck>(
      event: string,
      handler: (payload: TPayload, ack?: TAck) => void
    ): void {
      // Bridge: typed Socket.io → generic handler context
      (socket.on as (event: string, handler: unknown) => void)(event, handler);
    },

    emitToRoom(roomId: string, event: string, data: unknown): void {
      // Bridge: generic context → typed Socket.io
      (io.to(roomId).emit as (event: string, data: unknown) => void)(
        event,
        data
      );
    },

    emitToSocket(socketId: string, event: string, data: unknown): void {
      // Bridge: generic context → typed Socket.io
      (io.to(socketId).emit as (event: string, data: unknown) => void)(
        event,
        data
      );
    },

    getRoomById(roomId: string): BaseRoom | null {
      return getRoomById(roomId);
    },

    log(message: string, meta?: Record<string, unknown>): void {
      log(LogLevel.DEBUG, message, meta);
    },

    getSocketData(key: string): unknown {
      return (socket.data as Record<string, unknown>)[key];
    },

    setSocketData(key: string, value: unknown): void {
      (socket.data as Record<string, unknown>)[key] = value;
    },
  };
}

/**
 * Registers all game-specific socket event handlers for the connected socket.
 * Iterates through the game registry and calls each game's registerHandlers function.
 */
export function registerAllGameFeatures(
  io: AppServer,
  socket: AppSocket
): void {
  const ctx = createHandlerContext(io, socket);

  for (const module of gameRegistry.getAll()) {
    if (module.registerHandlers) {
      module.registerHandlers(ctx);
    }
  }
}
