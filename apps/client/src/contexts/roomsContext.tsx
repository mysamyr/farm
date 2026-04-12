import React, { createContext, useCallback, useState } from 'react';

import type { Room } from '@game/shared/types/farm';

type RoomsContextType = {
  rooms: Room[];
  currentRoom: Room | null;
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  setCurrentRoom: React.Dispatch<React.SetStateAction<Room | null>>;
  clearCurrentRoom: () => void;
};

export const RoomsContext = createContext<RoomsContextType | undefined>(
  undefined
);

export function RoomsProvider({ children }: { children: React.ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

  const clearCurrentRoom = useCallback(() => {
    setCurrentRoom(null);
  }, []);

  return (
    <RoomsContext.Provider
      value={{
        rooms,
        currentRoom,
        setRooms,
        setCurrentRoom,
        clearCurrentRoom,
      }}
    >
      {children}
    </RoomsContext.Provider>
  );
}
