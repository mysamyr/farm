import type { ComponentType } from 'react';

import type { GameId, GameColor } from '@game/shared/constants';

import type { LanguageCode } from '../constants/index.js';

interface BaseRuleConfig {
  key: string;
  label: (language: LanguageCode) => string;
}

export interface BooleanRuleConfig extends BaseRuleConfig {
  type?: 'boolean';
}

export interface NumberRuleConfig extends BaseRuleConfig {
  type: 'number';
  min: number;
  max: number;
  step: number;
  default: number;
}

export type RuleConfig = BooleanRuleConfig | NumberRuleConfig;

export interface GameConfig {
  id: GameId;
  maxPlayers: number;
  minPlayers: number;
  color: GameColor;
  emoji: string;
  bannerUrl: string;
  title: (language: LanguageCode) => string;
  shortDescription: (language: LanguageCode) => string;
  rules: RuleConfig[];
  GameboardPage: ComponentType;
  HelpModal: ComponentType;
  useGameSubscriptions: (args: { onCurrentUserWon: () => void }) => void;
}
