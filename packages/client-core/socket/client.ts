import type {
  CoreClientToServerEvents,
  CoreServerToClientEvents,
} from '@game/shared/types';
import { io, Socket } from 'socket.io-client';

import { getUserId } from '../utils';

// Base socket with core events only.
// Game-specific events are handled via type assertions in game packages.
type ClientToServerEvents = CoreClientToServerEvents;
type ServerToClientEvents = CoreServerToClientEvents;

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io({
  auth: { userId: getUserId() },
});

export function getSocketId(): string | null {
  return socket.id || null;
}

export function reconnectSocket(): void {
  try {
    socket.connect();
  } catch (error) {
    console.warn('Socket reconnect failed', error);
  }
}

/**
 * Emit a core event. For game-specific events, use emitGameEvent.
 */
export function emitEvent<E extends keyof ClientToServerEvents>(
  event: E,
  ...args: Parameters<ClientToServerEvents[E]>
): void {
  socket.emit(event, ...args);
}

/**
 * Emit a game-specific event with typed payload and ack.
 * Game packages should wrap this with properly typed functions.
 */
export function emitGameEvent<TPayload, TAck>(
  event: string,
  payload: TPayload,
  ack?: (response: TAck) => void
): void {
  (socket.emit as (event: string, payload: unknown, ack?: unknown) => void)(
    event,
    payload,
    ack
  );
}

export function subscribe<E extends keyof ServerToClientEvents>(
  event: E,
  handler: (...args: Parameters<ServerToClientEvents[E]>) => void
): void {
  socket.on(event, handler as never);
}

export function unsubscribe<E extends keyof ServerToClientEvents>(
  event: E,
  handler: (...args: Parameters<ServerToClientEvents[E]>) => void
): void {
  socket.off(event, handler as never);
}

/**
 * Subscribe to a game-specific event.
 * Game packages should wrap this with properly typed functions.
 */
export function subscribeGameEvent<TPayload>(
  event: string,
  handler: (payload: TPayload) => void
): void {
  (socket.on as (event: string, handler: unknown) => void)(event, handler);
}

/**
 * Unsubscribe from a game-specific event.
 */
export function unsubscribeGameEvent<TPayload>(
  event: string,
  handler: (payload: TPayload) => void
): void {
  (socket.off as (event: string, handler: unknown) => void)(event, handler);
}
