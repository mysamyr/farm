import { useContext } from 'react';

import { RoomsContext } from '../contexts/roomsContext';

export function useRoom() {
  const roomsContext = useContext(RoomsContext);

  if (!roomsContext) {
    throw new Error('useRoom must be used within RoomsProvider.');
  }

  return roomsContext;
}
