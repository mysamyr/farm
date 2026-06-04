import type { GameId } from '@game/shared/types';

import type { GameConfig } from './types';

export type { GameConfig, RuleConfig } from './types';

const registry = new Map<GameId, GameConfig>();

export function setGameConfigs(configs: Record<GameId, GameConfig>): void {
  for (const [id, config] of Object.entries(configs)) {
    registry.set(id as GameId, config);
  }
}

export function getGameConfig(id: GameId): GameConfig {
  const config = registry.get(id);
  if (!config) throw new Error(`Game "${id}" is not registered`);
  return config;
}
