import type { Skill } from './types.js';

export const DEFAULT_CONFIG = {
  maxPlayers: 2,
  minPlayers: 2,
} as const;

export const GAME_METADATA = {
  id: 'arena' as const,
  name: 'Arena',
  emoji: '⚔️',
  color: 'blue',
  minPlayers: DEFAULT_CONFIG.minPlayers,
  maxPlayers: DEFAULT_CONFIG.maxPlayers,
};

export const REQUIRED_ACTIVE_COUNT = 2;
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
  attack = 'attack',
  skip = 'skip',

  bleed_strike = 'bleed_strike',
  viper_strike = 'viper_strike',
  vampiric_strike = 'vampiric_strike',
  knockback = 'knockback',
  magic_shield = 'magic_shield',
  cleanse = 'cleanse',

  heal = 'heal',
  regeneration = 'regeneration',

  toughened = 'toughened',
  plating = 'plating',
  assassin = 'assassin',
  strong = 'strong',
  fanatic = 'fanatic',
  thorns = 'thorns',
  leech = 'leech',
}

export enum EffectId {
  regeneration = 'regeneration',
  resistance = 'resistance',
  thorns = 'thorns',
  leech = 'leech',
  poison = 'poison',
  bleed = 'bleed',
  stun = 'stun',
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
}

export enum ActionTarget {
  self = 'self',
  opponent = 'opponent',
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
      { type: ActionType.DAMAGE, target: ActionTarget.opponent, value: 10 },
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
      { type: ActionType.DAMAGE, target: ActionTarget.opponent, value: 10 },
      {
        type: ActionType.APPLY_STATUS,
        target: ActionTarget.opponent,
        status: EffectId.bleed,
        value: 10,
        isPercent: true,
        duration: 2,
      },
    ],
  },
  [SkillId.viper_strike]: {
    id: SkillId.viper_strike,
    type: SkillType.active,
    cooldown: 2,
    actions: [
      { type: ActionType.DAMAGE, target: ActionTarget.opponent, value: 10 },
      {
        type: ActionType.APPLY_STATUS,
        target: ActionTarget.opponent,
        status: EffectId.poison,
        value: 5,
        duration: 5,
      },
    ],
  },
  [SkillId.vampiric_strike]: {
    id: SkillId.vampiric_strike,
    type: SkillType.active,
    cooldown: 2,
    actions: [
      { type: ActionType.DAMAGE, target: ActionTarget.opponent, value: 12 },
      { type: ActionType.LIFE_STEAL, target: ActionTarget.self, value: 50 },
    ],
  },
  [SkillId.knockback]: {
    id: SkillId.knockback,
    type: SkillType.active,
    cooldown: 4,
    actions: [
      { type: ActionType.DAMAGE, target: ActionTarget.opponent, value: 10 },
      {
        type: ActionType.APPLY_STATUS,
        target: ActionTarget.opponent,
        status: EffectId.stun,
        duration: 1,
      },
    ],
  },
  [SkillId.magic_shield]: {
    id: SkillId.magic_shield,
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
  [SkillId.cleanse]: {
    id: SkillId.cleanse,
    type: SkillType.active,
    cooldown: 4,
    actions: [
      {
        type: ActionType.CLEANSE,
        target: ActionTarget.self,
      },
    ],
  },

  [SkillId.heal]: {
    id: SkillId.heal,
    type: SkillType.healing,
    cooldown: 3,
    actions: [{ type: ActionType.HEAL, target: ActionTarget.self, value: 20 }],
  },
  [SkillId.regeneration]: {
    id: SkillId.regeneration,
    type: SkillType.healing,
    cooldown: 3,
    actions: [
      {
        type: ActionType.HEAL,
        target: ActionTarget.self,
        value: 10,
      },
      {
        type: ActionType.APPLY_STATUS,
        target: ActionTarget.self,
        status: EffectId.regeneration,
        value: 5,
        duration: 3,
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
        value: 25,
        duration: 999,
      },
      {
        type: ActionType.MODIFY_STAT,
        target: ActionTarget.self,
        stat: StatId.armor,
        value: 10,
        duration: 999,
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
        value: 15,
        duration: 999,
      },
      {
        type: ActionType.MODIFY_STAT,
        target: ActionTarget.self,
        stat: StatId.attack,
        value: 5,
        duration: 999,
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
        value: 10,
        duration: 999,
      },
      {
        type: ActionType.MODIFY_STAT,
        target: ActionTarget.self,
        stat: StatId.crit,
        value: 15,
        duration: 999,
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
        value: 15,
        duration: 999,
      },
      {
        type: ActionType.MODIFY_STAT,
        target: ActionTarget.self,
        stat: StatId.crit,
        value: 5,
        duration: 999,
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
        value: 10,
        duration: 999,
      },
      {
        type: ActionType.MODIFY_STAT,
        target: ActionTarget.self,
        stat: StatId.hp,
        value: 15,
        duration: 999,
      },
      {
        type: ActionType.MODIFY_STAT,
        target: ActionTarget.self,
        stat: StatId.dodge,
        value: 5,
        duration: 999,
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
        value: 30,
        duration: 999,
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
        value: 30,
        duration: 999,
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
