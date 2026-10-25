import { getSocketId } from '@game/client-core/socket';

import {
  ActionTarget,
  DEFAULT_PLAYER_STATS,
  LogEffectKind,
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
  return player.eliminated;
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

/**
 * Animation keys for a player card. A key changes whenever a new combat step
 * affects that player, which lets the UI restart the matching CSS animation.
 */
export type PlayerFxKeys = {
  crit?: string;
  strike?: string;
  heal?: string;
};

/**
 * Derives card animation keys from the latest combat step. Only direct damage
 * and direct heals are considered; damage-over-time, lifesteal and regeneration
 * ticks do not animate.
 */
export function getPlayerFxKeys(
  room: Room | undefined,
  playerId: string
): PlayerFxKeys | undefined {
  const lastStep = room?.steps.at(-1);
  if (!lastStep) return undefined;

  const key = `${lastStep.step}-${playerId}`;
  const fx: PlayerFxKeys = {};

  for (const effect of lastStep.effects) {
    const targetId =
      effect.target === ActionTarget.self
        ? lastStep.playerId
        : lastStep.targetId;
    if (targetId !== playerId) continue;

    if (effect.kind === LogEffectKind.damage) {
      fx.strike = key;
      if (effect.isCrit) fx.crit = key;
    } else if (effect.kind === LogEffectKind.heal) {
      fx.heal = key;
    }
  }

  return fx.crit || fx.strike || fx.heal ? fx : undefined;
}
