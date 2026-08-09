import { getSocketId } from '@game/client-core/socket';

import {
  DEFAULT_PLAYER_STATS,
  type Player,
  type Room,
  type StatType,
} from '@game/game-arena/shared';

export type PlayerStats = Record<StatType, number>;

export function getPlayerStats(player: Player): PlayerStats {
  const stats: PlayerStats = { ...DEFAULT_PLAYER_STATS, hp: player.hp };

  for (const status of player.statuses) {
    if (status.type in stats) {
      stats[status.type as StatType] += status.value;
    }
  }

  return stats;
}

export function getCurrentPlayer(room: Room): Player | undefined {
  const socketId = getSocketId();
  return room.players.find(p => p.id === socketId);
}

export function getActivePlayerId(room: Room): string | undefined {
  return room.order[room.turn];
}

export function isAllPlayersReady(room: Room): boolean {
  return room.players.every(p => p.ready);
}
