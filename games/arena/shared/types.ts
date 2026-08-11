import { GameId } from '@game/shared/constants';
import type { BasePlayer, BaseRoom, BaseRules } from '@game/shared/types';

import {
  type ActionTarget,
  type ActionType,
  EffectId,
  type SkillId,
  type SkillType,
  type StatId,
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
  /* If no duration provided - permanent passive effect */
  duration?: number;
} & (
    | {
        status: EffectId.bleed;
        duration: number;
        value: number;
      }
    | {
        status: EffectId.poison;
        duration: number;
        value: number;
        isPercent?: never;
      }
    | {
        status: EffectId.regeneration;
        duration: number;
        value: number;
        isPercent?: boolean;
      }
    | {
        status: EffectId.resistance;
        duration: number;
        value?: never;
        isPercent?: never;
      }
    | {
        status: EffectId.stun;
        duration: number;
        value?: never;
        isPercent?: never;
      }
    | {
        status: EffectId.thorns;
        value: number;
        isPercent?: never;
      }
    | {
        status: EffectId.leech;
        value: number;
        isPercent?: never;
      }
    | {
        status: EffectId.pierce;
        value: number;
        isPercent?: never;
      }
  );

export type ModifyStatAction = BaseAction & {
  type: ActionType.MODIFY_STAT;
  stat: StatId;
  value: number;
  /* If no duration provided - permanent passive effect */
  duration?: number;
};

export type LifeStealAction = BaseAction & {
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
  | LifeStealAction;

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

// TODO: move to enums, create type guards for LogEffect
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
  remainingDuration?: number;
  isPercent?: boolean;
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
