import type { ComponentType } from 'react';

import type { GameId } from '@game/shared/types';

import type { AccentColor } from '../constants/theme';

export interface RuleConfig {
  key: string;
  label: (t: Record<string, string>) => string;
  // TODO: Add a type for the rule config options when we have more than just a label.
}

export interface GameConfig {
  id: GameId;
  maxPlayers: number;
  minPlayers: number;
  color: AccentColor;
  emoji: string;
  rules: RuleConfig[];
  GameboardPage: ComponentType;
  HelpModal: ComponentType;
  useGameSubscriptions: (args: { onCurrentUserWon: () => void }) => void;
}
