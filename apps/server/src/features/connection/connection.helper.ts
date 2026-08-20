import type { AppSocket } from '../../types/index.js';

export function getIpAddress(socket: AppSocket): string {
  return (
    (socket.handshake.headers['x-forwarded-for'] as string) ||
    socket.handshake.address ||
    ''
  );
}
