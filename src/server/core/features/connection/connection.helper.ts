import type { Socket } from 'socket.io';

export function getIpAddress(socket: Socket): string {
  return (
    (socket.handshake.headers['x-forwarded-for'] as string) ||
    socket.handshake.address ||
    ''
  );
}
