import type { ComponentType } from 'react';

import type { GameId, GameColor } from '@game/shared/constants';

import type { LanguageCode } from '../constants/index.js';

export interface RuleConfig {
  key: string;
  label: (language: LanguageCode) => string;
}

export interface GameConfig {
  id: GameId;
  maxPlayers: number;
  minPlayers: number;
  color: GameColor;
  emoji: string;
  rules: RuleConfig[];
  GameboardPage: ComponentType;
  HelpModal: ComponentType;
  useGameSubscriptions: (args: { onCurrentUserWon: () => void }) => void;
}
