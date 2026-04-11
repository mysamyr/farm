import type { Room } from '@shared/types/farm';

export const state: {
  currentRoom: Room | null;
  rooms: Room[];
} = {
  currentRoom: null,
  rooms: [],
};
