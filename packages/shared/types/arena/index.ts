import type { SKILLS } from '../../constants/arena';

import { BasePlayer, BaseRoom, BaseRules } from '../index';

export type SkillId = (typeof SKILLS)[number]['id'];

export type StatType = 'hp' | 'armor' | 'attack' | 'crit' | 'dodge';

export type ActionTarget = 'self' | 'opponent';

export type NegativeStatusType = 'poison' | 'bleed' | 'stun';

export type PositiveStatusType = 'regeneration' | 'resistance' | 'thorns';

export type StatusEffectType = NegativeStatusType | PositiveStatusType;

// === Actions ===
type BaseAction = {
  target: ActionTarget;
};

export type DamageAction = BaseAction & {
  type: 'DAMAGE';
  value: number;
  isPercent?: boolean;
};

export type HealAction = BaseAction & {
  type: 'HEAL';
  value: number;
  isPercent?: boolean;
};

export type ApplyStatusAction = BaseAction & {
  type: 'APPLY_STATUS';
  status: StatusEffectType;
  duration: number;
  value?: number;
  isPercent?: boolean;
};

export type ModifyStatAction = BaseAction & {
  type: 'MODIFY_STAT';
  stat: StatType;
  duration?: number;
  value?: number;
  isPercent?: boolean;
};

export type LifestealAction = BaseAction & {
  type: 'LIFESTEAL';
  target: 'self';
  /**
   * % of damage
   */
  value: number;
};

export type GameAction =
  | DamageAction
  | HealAction
  | ApplyStatusAction
  | ModifyStatAction
  | LifestealAction;

// === Skills ===
interface BaseSkill {
  id: string;
  actions: GameAction[];
}

export interface ActiveSkill extends BaseSkill {
  type: 'active';
  cooldown: number;
}

export interface PassiveSkill extends BaseSkill {
  type: 'passive';
}

export type Skill = ActiveSkill | PassiveSkill;

// === Log ===
export type LogEffectKind =
  | 'damage'
  | 'heal'
  | 'lifesteal'
  | 'bleed'
  | 'poison'
  | 'regeneration'
  | 'thorns'
  | 'dodge';

export interface LogEffect {
  kind: LogEffectKind;
  /**
   * damage dealt
   */
  value: number;
  target: 'self' | 'opponent';
  isCrit?: boolean;
}

export interface LogStep {
  step: number;
  playerId: string;
  playerName: string;
  skillId: SkillId;
  effects: LogEffect[];
}

// === Runtime State ===
export interface StatusEffect {
  type: StatType | StatusEffectType;
  value: number;
  remainingDuration: number;
  isPercent?: boolean;
  permanent?: boolean;
}

export interface PlayerSkill {
  id: SkillId;
  cooldown: number;
}

export interface Player extends BasePlayer {
  hp: number;
  statuses: StatusEffect[];
  skills: PlayerSkill[];
  ready: boolean;
}

export interface Room extends BaseRoom<Player, BaseRules, 'arena'> {
  order: string[];
  turn: number;
  activePlayerId?: string;
  winner?: string;
  steps: LogStep[];
}
