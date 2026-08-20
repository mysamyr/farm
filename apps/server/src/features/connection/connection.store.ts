import type { BasePlayer } from '@game/shared/types';

export type PendingDisconnect = {
  timeout: NodeJS.Timeout;
  oldSocketId: string;
  player: BasePlayer;
};

const pendingDisconnects = new Map<string, PendingDisconnect>();

export function getPendingDisconnect(
  userId: string
): PendingDisconnect | undefined {
  return pendingDisconnects.get(userId);
}

export function setPendingDisconnect(
  userId: string,
  pending: PendingDisconnect
): void {
  pendingDisconnects.set(userId, pending);
}

export function removePendingDisconnect(userId: string): boolean {
  return pendingDisconnects.delete(userId);
}

export function findPendingDisconnectBySocketId(
  socketId: string
): { userId: string; pending: PendingDisconnect } | undefined {
  for (const [userId, pending] of pendingDisconnects) {
    if (pending.oldSocketId === socketId) {
      return { userId, pending };
    }
  }
  return undefined;
}
