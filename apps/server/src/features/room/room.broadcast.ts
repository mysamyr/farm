import { EVENTS } from '@game/shared/constants';
import type { BaseRoom } from '@game/shared/types';

import type { AppServer } from '../../types/index.js';

import { listRooms } from './room.store.js';

export function updateRoomsList(io: AppServer): void {
  const summaries = listRooms().map((room): BaseRoom => ({
    id: room.id,
    name: room.name,
    ownerId: room.ownerId,
    game: room.game,
    state: room.state,
    players: room.players.map(({ id, name }) => ({ id, name })),
    spectators: room.spectators.map(({ id, name }) => ({ id, name })),
    rules: room.rules,
    blacklist: room.blacklist,
    winner: room.winner,
    startedAt: room.startedAt,
    vote: room.vote,
  }));
  io.emit(EVENTS.ROOMS_LIST, summaries);
}
