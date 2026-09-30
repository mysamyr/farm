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

export function isPlayerEliminated(player: Player): boolean {
  return player.eliminated === true;
}

/** Players in turn order, skipping ids that are no longer in the room. */
export function getPlayersInTurnOrder(room: Room): Player[] {
  return room.order
    .map(id => room.players.find(p => p.id === id))
    .filter((p): p is Player => Boolean(p));
}

/**
 * Opponents ordered by who acts next, starting from the slot right after the
 * given player. Reading left-to-right shows the upcoming turn sequence.
 */
export function getOpponentsInTurnOrder(
  room: Room,
  selfId: string | null | undefined
): Player[] {
  const ordered = getPlayersInTurnOrder(room);
  const selfIndex = ordered.findIndex(p => p.id === selfId);
  if (selfIndex === -1) return ordered.filter(p => p.id !== selfId);

  return [...ordered.slice(selfIndex + 1), ...ordered.slice(0, selfIndex)];
}

/** First alive opponent walking forward through the turn order. */
export function getDefaultTargetId(
  room: Room,
  selfId: string | null | undefined
): string | undefined {
  return getOpponentsInTurnOrder(room, selfId).find(p => !isPlayerEliminated(p))
    ?.id;
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
