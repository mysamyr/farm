import type { ComponentType } from 'react';

import type { GameId } from '@game/shared/constants';

import type { AccentColor, LanguageCode } from '../constants/index.js';

export interface RuleConfig {
  key: string;
  label: (language: LanguageCode) => string;
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
