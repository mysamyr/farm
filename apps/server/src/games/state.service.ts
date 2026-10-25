import { EVENTS } from '@game/shared/constants';
import type { BaseRoom, RoomRole } from '@game/shared/types';

import type { AppServer } from '../types/index.js';

import { gameRegistry } from './registry.js';

type ProjectRoom = (
  room: BaseRoom,
  viewerId: string,
  role: RoomRole
) => BaseRoom;

function forEachMember(
  room: BaseRoom,
  callback: (id: string, role: RoomRole) => void
): void {
  room.players.forEach(player => callback(player.id, 'player'));
  room.spectators.forEach(spectator => callback(spectator.id, 'spectator'));
}

function getProjector(room: BaseRoom, override?: ProjectRoom): ProjectRoom {
  return (
    override ?? gameRegistry.get(room.game).projectRoomState ?? (state => state)
  );
}

export function projectRoomState(
  room: BaseRoom,
  viewerId: string,
  role: RoomRole
): BaseRoom {
  return getProjector(room)(room, viewerId, role);
}

export function emitGameState(
  io: AppServer,
  room: BaseRoom,
  override?: ProjectRoom
): void {
  const project = getProjector(room, override);
  forEachMember(room, (viewerId, role) => {
    io.to(viewerId).emit(EVENTS.GAME_STATE_UPDATE, {
      state: project(room, viewerId, role),
    });
  });
}

export function emitGameStarted(io: AppServer, room: BaseRoom): void {
  const project = getProjector(room);
  forEachMember(room, (viewerId, role) => {
    io.to(viewerId).emit(EVENTS.GAME_STARTED, {
      room: project(room, viewerId, role),
    });
  });
}
