import type { ComponentType } from 'react';

import type { GameId } from '@game/shared/types';

export interface RuleConfig {
  key: string;
  label: (t: Record<string, string>) => string;
}

export interface GameConfig {
  id: GameId;
  maxPlayers: number;
  minPlayers: number;
  rules: RuleConfig[];
  GameboardPage: ComponentType;
  HelpModal: ComponentType;
  useGameSubscriptions: (args: { onCurrentUserWon: () => void }) => void;
}

const registry = new Map<GameId, GameConfig>();

export function registerGame(config: GameConfig): void {
  registry.set(config.id, config);
}

export function getGameConfig(id: GameId): GameConfig {
  const config = registry.get(id);
  if (!config) throw new Error(`Game "${id}" is not registered`);
  return config;
}

export function getDefaultGameConfig(): GameConfig {
  const first = registry.values().next().value;
  if (!first) throw new Error('No games registered');
  return first;
}
