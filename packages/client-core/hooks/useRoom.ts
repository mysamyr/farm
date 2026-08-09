import { useShallow } from 'zustand/react/shallow';

import { useRoomsStore } from '../store';

export function useRoom() {
  return useRoomsStore(
    useShallow(s => ({
      rooms: s.rooms,
      currentRoom: s.currentRoom,
      setRooms: s.setRooms,
      setCurrentRoom: s.setCurrentRoom,
      clearCurrentRoom: s.clearCurrentRoom,
    }))
  );
}
