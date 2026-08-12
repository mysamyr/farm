import { DEFAULT_PLAYER_STATS, StatId } from './constants.js';
import type { Player } from './types.js';

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
