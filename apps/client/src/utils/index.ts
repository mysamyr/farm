import type { BaseRoom } from '@game/shared/types';

export function getOwnerName(room: BaseRoom): string {
  const owner = room.players.find(player => player.id === room.ownerId);
  return owner ? owner.name : 'Unknown';
}

export * from './theme.js';
export * from './roomName/index.js';
export * from './statistics.js';
export * from './validation.js';
