import type { BaseRoom } from '@game/shared/types';

export function classNames(
  ...classes: (string | boolean | undefined)[]
): string {
  return classes.filter(Boolean).join(' ');
}

export function getOwnerName(room: BaseRoom): string {
  const owner = room.players.find(player => player.id === room.ownerId);
  return owner ? owner.name : 'Unknown';
}
