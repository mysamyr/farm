import {
  ActionType,
  DEFAULT_PLAYER_STATS,
  SKILLS,
  SkillType,
  StatId,
  type SkillId,
} from './constants.js';
import type { GameAction, Player, StatusEffect } from './types.js';

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

/**
 * Derive permanent passive statuses from a skill selection.
 */
export function getStatusesFromSkills(skillIds: SkillId[]): StatusEffect[] {
  return skillIds.flatMap(id => {
    const skill = SKILLS[id];
    if (!skill || skill.type !== SkillType.passive) return [];
    return skill.actions.reduce((acc: StatusEffect[], action: GameAction) => {
      if (action.type === ActionType.MODIFY_STAT) {
        acc.push({
          type: action.stat,
          value: action.value ?? 0,
        });
      }
      if (action.type === ActionType.APPLY_STATUS) {
        acc.push({
          type: action.status,
          value: action.value ?? 0,
        });
      }
      return acc;
    }, []);
  });
}
