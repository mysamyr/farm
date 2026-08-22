import { GameId } from '@game/shared/constants';
import type { BasePlayer, BaseRoom } from '@game/shared/types';

import {
  type ActionTarget,
  type ActionType,
  ActionValueSource,
  EffectId,
  GAME_RULES,
  LogEffectKind,
  type SkillId,
  type SkillType,
  type StatId,
} from './constants.js';

// Actions

type BaseAction = {
  target: ActionTarget;
  type: ActionType;
};

export type RawActionValue = {
  source: ActionValueSource.raw;
  amount: number;
};

export type CurrentHpActionValue = {
  source: ActionValueSource.currentHp;
  actor: ActionTarget;
  percent: number;
};

export type MaxHpActionValue = {
  source: ActionValueSource.maxHp;
  actor: ActionTarget;
  percent: number;
};

export type StatActionValue = {
  source: ActionValueSource.stat;
  actor: ActionTarget;
  stat: StatId;
  percent: number;
};

export type DamageDealtActionValue = {
  source: ActionValueSource.damageDealt;
  percent: number;
};

export type InstantActionValue =
  RawActionValue | CurrentHpActionValue | MaxHpActionValue | StatActionValue;

export type ReactiveActionValue = InstantActionValue | DamageDealtActionValue;

export type DamageAction = BaseAction & {
  type: ActionType.DAMAGE;
  value: InstantActionValue;
};

export type HealAction = BaseAction & {
  type: ActionType.HEAL;
  value: InstantActionValue;
};

export type ApplyStatusAction = BaseAction & {
  type: ActionType.APPLY_STATUS;
  /* If no duration provided - permanent passive effect */
  duration?: number;
} & (
    | {
        status: EffectId.bleed;
        duration: number;
        value: ReactiveActionValue;
      }
    | {
        status: EffectId.poison;
        duration: number;
        value: ReactiveActionValue;
      }
    | {
        status: EffectId.regeneration;
        duration: number;
        value: ReactiveActionValue;
      }
    | {
        status: EffectId.resistance;
        duration: number;
        value?: never;
      }
    | {
        status: EffectId.reflection;
        duration: number;
        value?: never;
      }
    | {
        status: EffectId.stun;
        duration: number;
        value?: never;
      }
    | {
        status: EffectId.thorns;
        value: InstantActionValue;
      }
    | {
        status: EffectId.leech;
        value: ReactiveActionValue;
      }
    | {
        status: EffectId.pierce;
        value: ReactiveActionValue;
      }
  );

export type ModifyStatAction = BaseAction & {
  type: ActionType.MODIFY_STAT;
  stat: StatId;
  value: InstantActionValue;
  /* If no duration provided - permanent passive effect */
  duration?: number;
};

export type LifeStealAction = BaseAction & {
  type: ActionType.LIFE_STEAL;
  target: ActionTarget.self;
  value: ReactiveActionValue;
};

export type CleanseAction = BaseAction & {
  type: ActionType.CLEANSE;
  target: ActionTarget.self;
};

export type ReduceCooldownsAction = BaseAction & {
  type: ActionType.REDUCE_COOLDOWNS;
  target: ActionTarget.self;
  amount: number;
};

export type GameAction =
  | DamageAction
  | HealAction
  | ApplyStatusAction
  | ModifyStatAction
  | CleanseAction
  | LifeStealAction
  | ReduceCooldownsAction;

// Skills

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

type BaseLogEffect = { target: ActionTarget };

export type ApplyStatusLogEffect = BaseLogEffect & {
  kind: LogEffectKind.apply_status;
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
      }
    | {
        status: EffectId.regeneration;
        duration: number;
        value: number;
      }
    | {
        status: EffectId.resistance;
        duration: number;
      }
    | {
        status: EffectId.reflection;
        duration: number;
      }
    | {
        status: EffectId.stun;
        duration: number;
      }
    | {
        status: EffectId.thorns;
        value: number;
      }
    | {
        status: EffectId.leech;
        value: number;
      }
    | {
        status: EffectId.pierce;
        value: number;
      }
  );

export type LogEffect =
  | (BaseLogEffect & {
      kind: LogEffectKind.damage;
      value: number;
      isCrit?: boolean;
    })
  | (BaseLogEffect & { kind: LogEffectKind.heal; value: number })
  | (BaseLogEffect & { kind: LogEffectKind.lifesteal; value: number })
  | (BaseLogEffect & { kind: LogEffectKind.bleed; value: number })
  | (BaseLogEffect & { kind: LogEffectKind.poison; value: number })
  | (BaseLogEffect & { kind: LogEffectKind.regeneration; value: number })
  | (BaseLogEffect & { kind: LogEffectKind.thorns; value: number })
  | (BaseLogEffect & { kind: LogEffectKind.leech; value: number })
  | (BaseLogEffect & { kind: LogEffectKind.dodge; value?: never })
  | ApplyStatusLogEffect
  | (BaseLogEffect & {
      kind: LogEffectKind.modify_stat;
      stat: StatId;
      value: number;
      duration?: number;
    })
  | (BaseLogEffect & { kind: LogEffectKind.cleanse })
  | (BaseLogEffect & { kind: LogEffectKind.reduce_cooldowns; value: number })
  | (BaseLogEffect & {
      kind: LogEffectKind.resist;
      status: EffectId.bleed | EffectId.poison;
    })
  | (BaseLogEffect & { kind: LogEffectKind.reflect });

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
  /** The remaining duration of the status. If not provided - permanent passive effect. */
  remainingDuration?: number;
  /** Combat step index when this status was applied; used to skip same-turn ticks. */
  appliedTurn?: number;
}

export interface PlayerSkill {
  id: SkillId;
  cooldown: number;
}

export interface Player extends BasePlayer {
  /** The current HP of the player. Can be negative if player has statuses that increase player's HP. */
  hp: number;
  /** The statuses currently affecting the player. */
  statuses: StatusEffect[];
  /** The skills the player currently has. */
  skills: PlayerSkill[];
  /** Whether the player is ready to take their turn. */
  ready: boolean;
}

// Room
export type Rules = Record<GAME_RULES, boolean>;

export interface Room extends BaseRoom<Player, Rules, GameId.arena> {
  order: string[];
  turn: number;
  winner?: string;
  steps: LogStep[];
}
