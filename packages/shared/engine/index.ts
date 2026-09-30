import type { BaseRoom, RoomRole } from '../types/index.js';

/**
 * Context provided to game handlers for socket operations.
 * Abstracts socket.io from game-specific handler code.
 */
export interface GameHandlerContext {
  /** Current socket ID */
  readonly socketId: string;

  /** Register an event listener */
  on<TPayload, TAck>(
    event: string,
    handler: (payload: TPayload, ack?: TAck) => void
  ): void;

  /** Emit an event to a specific room */
  emitToRoom(roomId: string, event: string, payload: unknown): void;

  /** Emit an event to a specific socket */
  emitToSocket(socketId: string, event: string, payload: unknown): void;

  /** Emit an authoritative, optionally viewer-projected game state. */
  emitGameState(
    room: BaseRoom,
    project?: (room: BaseRoom, viewerId: string, role: RoomRole) => BaseRoom
  ): void;

  /** Get a room by ID */
  getRoomById(roomId: string): BaseRoom | null;

  /**
   * Kick a player from a room (blacklist + remove).
   * Games can call this without going through the owner-only socket event.
   */
  kickPlayer(roomId: string, playerId: string): boolean;

  /** Log a message */
  log(message: string, data?: Record<string, unknown>): void;

  /** Get socket session data */
  getSocketData(key: string): unknown;

  /** Set socket session data */
  setSocketData(key: string, value: unknown): void;
}
