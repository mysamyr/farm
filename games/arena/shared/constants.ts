import { GameColor, GameId } from '@game/shared/constants';
import type { GameMetadata } from '@game/shared/types';

import type { Skill } from './types.js';

export const DEFAULT_CONFIG = {
  maxPlayers: 2,
  minPlayers: 2,
} as const;

export const GAME_METADATA = {
  id: GameId.arena,
  name: 'Arena',
  emoji: '⚔️',
  color: GameColor.blue,
  minPlayers: DEFAULT_CONFIG.minPlayers,
  maxPlayers: DEFAULT_CONFIG.maxPlayers,
} satisfies GameMetadata;

export const REQUIRED_ACTIVE_COUNT = 3;
export const REQUIRED_HEALING_COUNT = 1;
export const REQUIRED_PASSIVE_COUNT = 2;

export enum StatId {
  hp = 'hp',
  armor = 'armor',
  attack = 'attack',
  crit = 'crit',
  dodge = 'dodge',
}

export enum SkillId {
  // Base
  attack = 'attack',
  skip = 'skip',

  // Active strikes
  bleed_strike = 'bleed_strike',
  viper_strike = 'viper_strike',
  vampiric_strike = 'vampiric_strike',
  bash_strike = 'bash_strike',
  // Active debuffs
  knockback = 'knockback',
  corrosion = 'corrosion',
  // Active buffs
  resistance = 'resistance',
  cleanse = 'cleanse',
  meditation = 'meditation',
  rage = 'rage',
  spiked_armor = 'spiked_armor',
  reflect = 'reflect',

  // Healing
  heal = 'heal',
  regeneration = 'regeneration',

  // Passive
  toughened = 'toughened',
  plating = 'plating',
  assassin = 'assassin',
  strong = 'strong',
  fanatic = 'fanatic',
  thorns = 'thorns',
  leech = 'leech',
  pierce = 'pierce',
}

export enum EffectId {
  /** Adds hp over time */
  regeneration = 'regeneration',
  /** Prevents from getting bleed or poison. Doesn't remove active effects */
  resistance = 'resistance',
  /** Returns part of direct damage back to attacker */
  thorns = 'thorns',
  /** Returns part of direct damage back to attacker as hp */
  leech = 'leech',
  /** Applies constant damage over time */
  poison = 'poison',
  /** Applies damage over time based on player's current hp */
  bleed = 'bleed',
  /** Removes possibility to use skills. No cooldown reduction */
  stun = 'stun',
  /** Ignores some amount of opponent's defense */
  pierce = 'pierce',
  /** Redirects incoming debuffs to the attacker */
  reflection = 'reflection',
}

export enum SkillType {
  active = 'active',
  healing = 'healing',
  passive = 'passive',
}

export enum ActionType {
  DAMAGE = 'DAMAGE',
  HEAL = 'HEAL',
  APPLY_STATUS = 'APPLY_STATUS',
  MODIFY_STAT = 'MODIFY_STAT',
  LIFE_STEAL = 'LIFE_STEAL',
  CLEANSE = 'CLEANSE',
  REDUCE_COOLDOWNS = 'REDUCE_COOLDOWNS',
}

export enum ActionTarget {
  self = 'self',
  opponent = 'opponent',
}

export enum ActionValueSource {
  raw = 'raw',
  currentHp = 'currentHp',
  maxHp = 'maxHp',
  stat = 'stat',
  damageDealt = 'damageDealt',
}

export enum LogEffectKind {
  damage = 'damage',
  heal = 'heal',
  lifesteal = 'lifesteal',
  bleed = 'bleed',
  poison = 'poison',
  regeneration = 'regeneration',
  thorns = 'thorns',
  leech = 'leech',
  dodge = 'dodge',
  apply_status = 'apply_status',
  modify_stat = 'modify_stat',
  cleanse = 'cleanse',
  reduce_cooldowns = 'reduce_cooldowns',
  resist = 'resist',
  reflect = 'reflect',
}

export const DEFAULT_PLAYER_STATS: Record<StatId, number> = {
  hp: 100,
  armor: 0,
  attack: 0,
  crit: 5,
  dodge: 5,
};

export const SKILLS: Record<SkillId, Skill> = {
  [SkillId.attack]: {
    id: SkillId.attack,
    type: SkillType.active,
    cooldown: 0,
    actions: [
      {
        type: ActionType.DAMAGE,
        target: ActionTarget.opponent,
        value: { source: ActionValueSource.raw, amount: 10 },
      },
    ],
  },
  [SkillId.skip]: {
    id: SkillId.skip,
    type: SkillType.active,
    cooldown: 0,
    actions: [],
  },

  [SkillId.bleed_strike]: {
    id: SkillId.bleed_strike,
    type: SkillType.active,
    cooldown: 2,
    actions: [
      {
        type: ActionType.DAMAGE,
        target: ActionTarget.opponent,
        value: { source: ActionValueSource.raw, amount: 8 },
      },
      {
        type: ActionType.APPLY_STATUS,
        target: ActionTarget.opponent,
        status: EffectId.bleed,
        value: { source: ActionValueSource.raw, amount: 15 },
        duration: 2,
      },
    ],
  },
  [SkillId.viper_strike]: {
    id: SkillId.viper_strike,
    type: SkillType.active,
    cooldown: 2,
    actions: [
      {
        type: ActionType.DAMAGE,
        target: ActionTarget.opponent,
        value: { source: ActionValueSource.raw, amount: 6 },
      },
      {
        type: ActionType.APPLY_STATUS,
        target: ActionTarget.opponent,
        status: EffectId.poison,
        value: { source: ActionValueSource.raw, amount: 5 },
        duration: 5,
      },
    ],
  },
  [SkillId.vampiric_strike]: {
    id: SkillId.vampiric_strike,
    type: SkillType.active,
    cooldown: 2,
    actions: [
      {
        type: ActionType.DAMAGE,
        target: ActionTarget.opponent,
        value: { source: ActionValueSource.raw, amount: 10 },
      },
      {
        type: ActionType.LIFE_STEAL,
        target: ActionTarget.self,
        value: { source: ActionValueSource.damageDealt, percent: 50 },
      },
    ],
  },
  [SkillId.bash_strike]: {
    id: SkillId.bash_strike,
    type: SkillType.active,
    cooldown: 3,
    actions: [
      {
        type: ActionType.DAMAGE,
        target: ActionTarget.opponent,
        value: { source: ActionValueSource.raw, amount: 8 },
      },
      {
        type: ActionType.MODIFY_STAT,
        target: ActionTarget.opponent,
        stat: StatId.attack,
        value: { source: ActionValueSource.raw, amount: -5 },
        duration: 2,
      },
    ],
  },
  [SkillId.knockback]: {
    id: SkillId.knockback,
    type: SkillType.active,
    cooldown: 3,
    actions: [
      {
        type: ActionType.DAMAGE,
        target: ActionTarget.opponent,
        value: { source: ActionValueSource.raw, amount: 8 },
      },
      {
        type: ActionType.APPLY_STATUS,
        target: ActionTarget.opponent,
        status: EffectId.stun,
        duration: 1,
      },
    ],
  },
  [SkillId.corrosion]: {
    id: SkillId.corrosion,
    type: SkillType.active,
    cooldown: 3,
    actions: [
      {
        type: ActionType.MODIFY_STAT,
        target: ActionTarget.opponent,
        stat: StatId.armor,
        value: { source: ActionValueSource.raw, amount: -5 },
        duration: 3,
      },
    ],
  },
  [SkillId.resistance]: {
    id: SkillId.resistance,
    type: SkillType.active,
    cooldown: 3,
    actions: [
      {
        type: ActionType.APPLY_STATUS,
        target: ActionTarget.self,
        status: EffectId.resistance,
        duration: 3,
      },
    ],
  },
  [SkillId.rage]: {
    id: SkillId.rage,
    type: SkillType.active,
    cooldown: 3,
    actions: [
      {
        type: ActionType.MODIFY_STAT,
        target: ActionTarget.self,
        stat: StatId.attack,
        value: { source: ActionValueSource.raw, amount: 8 },
        duration: 3,
      },
    ],
  },
  [SkillId.spiked_armor]: {
    id: SkillId.spiked_armor,
    type: SkillType.active,
    cooldown: 3,
    actions: [
      {
        type: ActionType.APPLY_STATUS,
        target: ActionTarget.self,
        status: EffectId.thorns,
        value: { source: ActionValueSource.raw, amount: 60 },
        duration: 2,
      },
    ],
  },
  [SkillId.reflect]: {
    id: SkillId.reflect,
    type: SkillType.active,
    cooldown: 4,
    actions: [
      {
        type: ActionType.APPLY_STATUS,
        target: ActionTarget.self,
        status: EffectId.reflection,
        duration: 2,
      },
    ],
  },

  [SkillId.heal]: {
    id: SkillId.heal,
    type: SkillType.healing,
    cooldown: 3,
    actions: [
      {
        type: ActionType.HEAL,
        target: ActionTarget.self,
        value: { source: ActionValueSource.raw, amount: 20 },
      },
    ],
  },
  [SkillId.regeneration]: {
    id: SkillId.regeneration,
    type: SkillType.healing,
    cooldown: 3,
    actions: [
      {
        type: ActionType.HEAL,
        target: ActionTarget.self,
        value: { source: ActionValueSource.raw, amount: 5 },
      },
      {
        type: ActionType.APPLY_STATUS,
        target: ActionTarget.self,
        status: EffectId.regeneration,
        value: { source: ActionValueSource.raw, amount: 6 },
        duration: 3,
      },
    ],
  },
  [SkillId.cleanse]: {
    id: SkillId.cleanse,
    type: SkillType.healing,
    cooldown: 2,
    actions: [
      {
        type: ActionType.CLEANSE,
        target: ActionTarget.self,
      },
      {
        type: ActionType.HEAL,
        target: ActionTarget.self,
        value: { source: ActionValueSource.raw, amount: 5 },
      },
    ],
  },
  [SkillId.meditation]: {
    id: SkillId.meditation,
    type: SkillType.active,
    cooldown: 2,
    actions: [
      {
        type: ActionType.REDUCE_COOLDOWNS,
        target: ActionTarget.self,
        amount: 1,
      },
    ],
  },

  [SkillId.toughened]: {
    id: SkillId.toughened,
    type: SkillType.passive,
    actions: [
      {
        type: ActionType.MODIFY_STAT,
        target: ActionTarget.self,
        stat: StatId.hp,
        value: { source: ActionValueSource.raw, amount: 20 },
      },
      {
        type: ActionType.MODIFY_STAT,
        target: ActionTarget.self,
        stat: StatId.armor,
        value: { source: ActionValueSource.raw, amount: 3 },
      },
    ],
  },
  [SkillId.plating]: {
    id: SkillId.plating,
    type: SkillType.passive,
    actions: [
      {
        type: ActionType.MODIFY_STAT,
        target: ActionTarget.self,
        stat: StatId.armor,
        value: { source: ActionValueSource.raw, amount: 5 },
      },
      {
        type: ActionType.MODIFY_STAT,
        target: ActionTarget.self,
        stat: StatId.attack,
        value: { source: ActionValueSource.raw, amount: 3 },
      },
    ],
  },
  [SkillId.assassin]: {
    id: SkillId.assassin,
    type: SkillType.passive,
    actions: [
      {
        type: ActionType.MODIFY_STAT,
        target: ActionTarget.self,
        stat: StatId.dodge,
        value: { source: ActionValueSource.raw, amount: 10 },
      },
      {
        type: ActionType.MODIFY_STAT,
        target: ActionTarget.self,
        stat: StatId.crit,
        value: { source: ActionValueSource.raw, amount: 15 },
      },
    ],
  },
  [SkillId.strong]: {
    id: SkillId.strong,
    type: SkillType.passive,
    actions: [
      {
        type: ActionType.MODIFY_STAT,
        target: ActionTarget.self,
        stat: StatId.attack,
        value: { source: ActionValueSource.raw, amount: 6 },
      },
      {
        type: ActionType.MODIFY_STAT,
        target: ActionTarget.self,
        stat: StatId.crit,
        value: { source: ActionValueSource.raw, amount: 5 },
      },
    ],
  },
  [SkillId.fanatic]: {
    id: SkillId.fanatic,
    type: SkillType.passive,
    actions: [
      {
        type: ActionType.MODIFY_STAT,
        target: ActionTarget.self,
        stat: StatId.attack,
        value: { source: ActionValueSource.raw, amount: 4 },
      },
      {
        type: ActionType.MODIFY_STAT,
        target: ActionTarget.self,
        stat: StatId.hp,
        value: { source: ActionValueSource.raw, amount: 15 },
      },
      {
        type: ActionType.MODIFY_STAT,
        target: ActionTarget.self,
        stat: StatId.dodge,
        value: { source: ActionValueSource.raw, amount: 5 },
      },
    ],
  },
  [SkillId.thorns]: {
    id: SkillId.thorns,
    type: SkillType.passive,
    actions: [
      {
        type: ActionType.APPLY_STATUS,
        target: ActionTarget.self,
        status: EffectId.thorns,
        value: { source: ActionValueSource.raw, amount: 40 },
      },
    ],
  },
  [SkillId.leech]: {
    id: SkillId.leech,
    type: SkillType.passive,
    actions: [
      {
        type: ActionType.APPLY_STATUS,
        target: ActionTarget.self,
        status: EffectId.leech,
        value: { source: ActionValueSource.raw, amount: 30 },
      },
    ],
  },
  [SkillId.pierce]: {
    id: SkillId.pierce,
    type: SkillType.passive,
    actions: [
      {
        type: ActionType.APPLY_STATUS,
        target: ActionTarget.self,
        status: EffectId.pierce,
        value: { source: ActionValueSource.raw, amount: 5 },
      },
    ],
  },
};

export const BASE_SKILLS: SkillId[] = [SkillId.attack, SkillId.skip];

export const CUSTOM_SKILLS: SkillId[] = Object.values(SkillId).filter(
  v => !BASE_SKILLS.includes(v)
);

export const NEGATIVE_EFFECTS: EffectId[] = [
  EffectId.poison,
  EffectId.bleed,
  EffectId.stun,
];

export enum GAME_RULES {
  ZERO_COOLDOWN = 'zero_cooldown',
}
