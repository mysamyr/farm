import { getRoomRole } from '@game/shared/utils';

import { getSocketId } from '../socket/index.js';

import { useRoom } from './useRoom.js';

export function useRoomRole() {
  const { currentRoom } = useRoom();
  const role = getRoomRole(currentRoom, getSocketId());

  return {
    role,
    isPlayer: role === 'player',
    isSpectator: role === 'spectator',
    canAct: role === 'player',
  };
}
