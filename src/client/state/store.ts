import type { Room } from '@shared/types';

export const state: {
  currentRoom: Room | null;
  rooms: Room[];
} = {
  currentRoom: null,
  rooms: [],
};
