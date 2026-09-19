import { ROOM_STATES } from '@game/shared/constants';
import type { RoomRole } from '@game/shared/types';

import type { Room } from '../shared/index.js';

export function projectRoomState(
  room: Room,
  viewerId: string,
  role: RoomRole
): Room {
  if (
    role === 'spectator' ||
    room.state !== ROOM_STATES.RUNNING ||
    room.players.every(player => player.ready)
  ) {
    return room;
  }

  return {
    ...room,
    players: room.players.map(player =>
      player.id === viewerId
        ? player
        : {
            ...player,
            skills: [],
            loadout: [],
            statuses: [],
          }
    ),
  };
}
