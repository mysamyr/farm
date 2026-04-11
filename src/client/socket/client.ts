const socket = (window as unknown as { io: () => unknown }).io() as unknown as {
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
  } catch (e) {
    console.warn('Socket reconnect failed', e);
  }
}

export function emitEvent<T extends Record<string, unknown>>(
  event: string,
  payload: Record<string, unknown> | null,
  cb?: (res: T) => void
): void {
  console.log('Emitting event:', event, payload);
  socket.emit(event, payload, cb || ((): void => {}));
}

export function subscribe<T>(
  event: string,
  handler: (payload: T) => void
): void {
  socket.on(event, (payload: T): void => {
    console.log('Received event:', event, payload);
    handler(payload);
  });
}
