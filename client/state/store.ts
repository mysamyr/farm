import type { Room } from '../types';

export const state: {
  currentRoom: Room | null;
  rooms: Room[];
} = {
  currentRoom: null,
  rooms: [],
};
