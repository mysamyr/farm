import {
  ActionTarget,
  ActionType,
  ActionValueSource,
  DEFAULT_PLAYER_STATS,
  SKILLS,
  SkillType,
  StatId,
  type SkillId,
} from './constants.js';
import type {
  GameAction,
  Player,
  ReactiveActionValue,
  StatusEffect,
} from './types.js';

export type ValueContext = {
  self: Player;
  opponent?: Player;
  damageDealt?: number;
};

/**
 * Get the maximum HP of a player based on their statuses.
 * @param player The player whose maximum HP is being calculated.
 */
export function getPlayerMaxHp(player: Player): number {
  return player.statuses.reduce(
    (acc: number, status) =>
      status.type === StatId.hp ? acc + status.value : acc,
    DEFAULT_PLAYER_STATS.hp
  );
}

function getActor(ctx: ValueContext, actor: ActionTarget): Player | undefined {
  return actor === ActionTarget.self ? ctx.self : ctx.opponent;
}

function getActorStat(player: Player, stat: StatId): number {
  const base = stat === StatId.hp ? player.hp : 0;
  return player.statuses.reduce((acc, status) => {
    if (status.type === stat) return acc + status.value;
    return acc;
  }, base);
}

export function resolveActionValue(
  spec: ReactiveActionValue,
  ctx: ValueContext
): number {
  switch (spec.source) {
    case ActionValueSource.raw:
      return spec.amount;
    case ActionValueSource.currentHp: {
      const actor = getActor(ctx, spec.actor);
      if (!actor) return 0;
      return Math.floor((getActorStat(actor, StatId.hp) * spec.percent) / 100);
    }
    case ActionValueSource.maxHp: {
      const actor = getActor(ctx, spec.actor);
      if (!actor) return 0;
      return Math.floor((getPlayerMaxHp(actor) * spec.percent) / 100);
    }
    case ActionValueSource.stat: {
      const actor = getActor(ctx, spec.actor);
      if (!actor) return 0;
      return Math.floor((getActorStat(actor, spec.stat) * spec.percent) / 100);
    }
    case ActionValueSource.damageDealt:
      return Math.floor(((ctx.damageDealt ?? 0) * spec.percent) / 100);
  }
}

/**
 * Derive permanent passive statuses from a skill selection.
 */
export function getStatusesFromSkills(
  skillIds: SkillId[],
  player: Player
): StatusEffect[] {
  const valueCtx: ValueContext = { self: player };
  return skillIds.flatMap(id => {
    const skill = SKILLS[id];
    if (!skill || skill.type !== SkillType.passive) return [];
    return skill.actions.reduce((acc: StatusEffect[], action: GameAction) => {
      if (action.type === ActionType.MODIFY_STAT) {
        acc.push({
          type: action.stat,
          value: resolveActionValue(action.value, valueCtx),
        });
      }
      if (action.type === ActionType.APPLY_STATUS) {
        acc.push({
          type: action.status,
          value: action.value ? resolveActionValue(action.value, valueCtx) : 0,
        });
      }
      return acc;
    }, []);
  });
}
