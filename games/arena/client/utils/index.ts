import { getSocketId } from '@game/client-core/socket';

import {
  DEFAULT_PLAYER_STATS,
  type Player,
  type Room,
  type SkillId,
  StatId,
} from '@game/game-arena/shared';

import { getStatusesFromSkills } from '../../shared/helpers.js';

export function getPlayerStats(player: Player): Record<StatId, number> {
  const stats = { ...DEFAULT_PLAYER_STATS, hp: player.hp };

  for (const status of player.statuses) {
    if (status.type in stats) {
      stats[status.type as StatId] += status.value;
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

export function getPreviewPlayer(player: Player, skillIds: SkillId[]): Player {
  return {
    ...player,
    hp: DEFAULT_PLAYER_STATS.hp,
    statuses: getStatusesFromSkills(skillIds, player),
  };
}
