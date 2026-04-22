import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@game/shared/types/socket';
import { io, Socket } from 'socket.io-client';

import { getUserId } from '../utils/identity';

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

export function emitEvent<E extends keyof ClientToServerEvents>(
  event: E,
  ...args: Parameters<ClientToServerEvents[E]>
): void {
  socket.emit(event, ...args);
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
