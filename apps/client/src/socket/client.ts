const socket = (window as unknown as { io: () => unknown }).io() as {
  id: string;
  emit: (...args: unknown[]) => void;
  on: (...args: unknown[]) => void;
  connect: () => void;
};

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

export function emitEvent<T extends Record<string, unknown>>(
  event: string,
  payload: Record<string, unknown> | null,
  cb?: (res: T) => void
): void {
  socket.emit(event, payload, cb || (() => {}));
}

export function subscribe<T>(
  event: string,
  handler: (payload: T) => void
): void {
  socket.on(event, (payload: T): void => {
    handler(payload);
  });
}
