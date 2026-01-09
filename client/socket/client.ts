import { EVENTS, SELECTORS } from '../constants';

import type { Player, Room } from '../types';

const socket = (window as unknown as { io: () => unknown }).io() as unknown as {
  id: string;
  emit: (...args: unknown[]) => void;
  on: (...args: unknown[]) => void;
  connect?: () => void;
};

type Handlers = {
  onRoomsList: (rooms: Room[]) => void;
  onRoomClosed: () => void;
  onGameStarted: (payload: { room: Room }) => void;
  onGameUpdate: (payload: { room: Room }) => void;
  onGameFinished: (payload: { winner: Player }) => void;
};

export function getSocketId(): string | null {
  return socket.id || null;
}

export function reconnectSocket(): void {
  try {
    socket.connect?.();
  } catch (e) {
    console.warn('Socket reconnect failed', e);
  }
}

export function emitEvent<T extends Record<string, unknown>>(
  event: string,
  payload: Record<string, unknown>,
  cb?: (res: T) => void
): void {
  console.log('Emitting event:', event, payload);
  socket.emit(event, payload, cb || ((): void => {}));
}

function subscribe<T>(event: string, handler: (payload: T) => void): void {
  socket.on(event, (payload: T): void => {
    console.log('Received event:', event, payload);
    handler(payload);
  });
}

export function setupSocket(handlers: Handlers): void {
  socket.on('connect', (): void => {
    console.log('Connected:', socket.id);
    const nameEl = document.getElementById(
      SELECTORS.inputs.userName
    ) as HTMLInputElement;
    const name = nameEl?.value.trim();
    if (name) emitEvent('player:rename', { name });
  });

  subscribe<Room[]>(EVENTS.ROOMS_LIST, handlers.onRoomsList);
  subscribe(EVENTS.ROOM_CLOSE, handlers.onRoomClosed);
  subscribe<{ room: Room }>(EVENTS.GAME_STARTED, handlers.onGameStarted);
  subscribe<{ room: Room }>(EVENTS.GAME_UPDATE, handlers.onGameUpdate);
  subscribe<{ winner: Player }>(EVENTS.GAME_FINISHED, handlers.onGameFinished);
}
