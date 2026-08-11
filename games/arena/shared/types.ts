import { GameId } from '@game/shared/constants';
import type { BasePlayer, BaseRoom, BaseRules } from '@game/shared/types';

import type {
  ActionTarget,
  ActionType,
  EffectId,
  SkillId,
  SkillType,
  StatId,
} from './constants.js';

type BaseAction = {
  target: ActionTarget;
};

export type DamageAction = BaseAction & {
  type: ActionType.DAMAGE;
  /* Damage. If isPercent = true - then % of opponent's current HP */
  value: number;
  isPercent?: boolean;
};

export type HealAction = BaseAction & {
  type: ActionType.HEAL;
  value: number;
  isPercent?: boolean;
};

export type ApplyStatusAction = BaseAction & {
  type: ActionType.APPLY_STATUS;
  status: EffectId;
  duration: number;
  value?: number;
  isPercent?: boolean;
};

export type ModifyStatAction = BaseAction & {
  type: ActionType.MODIFY_STAT;
  stat: StatId;
  duration?: number;
  value?: number;
  isPercent?: boolean;
};

export type LifestealAction = BaseAction & {
  type: ActionType.LIFE_STEAL;
  target: ActionTarget.self;
  /** % of damage */
  value: number;
};

export type CleanseAction = BaseAction & {
  type: ActionType.CLEANSE;
  target: ActionTarget.self;
};

export type GameAction =
  | DamageAction
  | HealAction
  | ApplyStatusAction
  | ModifyStatAction
  | CleanseAction
  | LifestealAction;

interface BaseSkill {
  id: SkillId;
  actions: GameAction[];
}

export interface ActiveSkill extends BaseSkill {
  type: SkillType.active;
  cooldown: number;
}

export interface HealingSkill extends BaseSkill {
  type: SkillType.healing;
  cooldown: number;
}

export interface PassiveSkill extends BaseSkill {
  type: SkillType.passive;
}

export type Skill = ActiveSkill | HealingSkill | PassiveSkill;

// Logs

export type LogEffectKind =
  | 'damage'
  | 'heal'
  | 'lifesteal'
  | 'bleed'
  | 'poison'
  | 'regeneration'
  | 'thorns'
  | 'leech'
  | 'dodge';

export interface LogEffect {
  kind: LogEffectKind;
  /** damage dealt */
  value: number;
  target: ActionTarget;
  isCrit?: boolean;
}

export interface LogStep {
  step: number;
  playerId: string;
  playerName: string;
  skillId: SkillId;
  effects: LogEffect[];
}

// Player

export interface StatusEffect {
  type: StatId | EffectId;
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

// Room

export interface Room extends BaseRoom<Player, BaseRules, GameId.arena> {
  order: string[];
  turn: number;
  activePlayerId?: string;
  winner?: string;
  steps: LogStep[];
}
