import { EVENTS } from '@game/shared/constants';

import type {
  ActiveSkill,
  HealingSkill,
  PassiveSkill,
  Skill,
  StatType,
  StatusEffectType,
} from './types.js';

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

export const DEFAULT_PLAYER_STATS: Record<StatType, number> = {
  hp: 100,
  armor: 0,
  attack: 0,
  crit: 5,
  dodge: 5,
};

export const BASE_SKILLS: ActiveSkill[] = [
  {
    id: 'attack',
    type: 'active',
    cooldown: 0,
    actions: [{ type: 'DAMAGE', target: 'opponent', value: 10 }],
  },
  {
    id: 'skip',
    type: 'active',
    cooldown: 0,
    actions: [],
  },
];

const ACTIVE_SKILLS: ActiveSkill[] = [
  {
    id: 'bleed_strike',
    type: 'active',
    cooldown: 2,
    actions: [
      { type: 'DAMAGE', target: 'opponent', value: 10 },
      {
        type: 'APPLY_STATUS',
        target: 'opponent',
        status: 'bleed',
        value: 10,
        isPercent: true,
        duration: 2,
      },
    ],
  },
  {
    id: 'viper_strike',
    type: 'active',
    cooldown: 2,
    actions: [
      { type: 'DAMAGE', target: 'opponent', value: 10 },
      {
        type: 'APPLY_STATUS',
        target: 'opponent',
        status: 'poison',
        value: 5,
        duration: 5,
      },
    ],
  },
  {
    id: 'vampiric_strike',
    type: 'active',
    cooldown: 2,
    actions: [
      { type: 'DAMAGE', target: 'opponent', value: 12 },
      { type: 'LIFESTEAL', target: 'self', value: 50 },
    ],
  },
  {
    id: 'knockback',
    type: 'active',
    cooldown: 4,
    actions: [
      { type: 'DAMAGE', target: 'opponent', value: 10 },
      {
        type: 'APPLY_STATUS',
        target: 'opponent',
        status: 'stun',
        duration: 1,
      },
    ],
  },
  {
    id: 'magic_shield',
    type: 'active',
    cooldown: 3,
    actions: [
      {
        type: 'APPLY_STATUS',
        target: 'self',
        status: 'resistance',
        duration: 3,
      },
    ],
  },
  {
    id: 'cleanse',
    type: 'active',
    cooldown: 4,
    actions: [
      {
        type: 'CLEANSE',
        target: 'self',
      },
    ],
  },
];

const HEALING_SKILLS: HealingSkill[] = [
  {
    id: 'heal',
    type: 'healing',
    cooldown: 3,
    actions: [{ type: 'HEAL', target: 'self', value: 20 }],
  },
  {
    id: 'regeneration',
    type: 'healing',
    cooldown: 3,
    actions: [
      {
        type: 'HEAL',
        target: 'self',
        value: 10,
      },
      {
        type: 'APPLY_STATUS',
        target: 'self',
        status: 'regeneration',
        value: 5,
        duration: 3,
      },
    ],
  },
];

const PASSIVE_SKILLS: PassiveSkill[] = [
  {
    id: 'toughened',
    type: 'passive',
    actions: [
      {
        type: 'MODIFY_STAT',
        target: 'self',
        stat: 'hp',
        value: 25,
        duration: 999,
      },
      {
        type: 'MODIFY_STAT',
        target: 'self',
        stat: 'armor',
        value: 10,
        duration: 999,
      },
    ],
  },
  {
    id: 'plating',
    type: 'passive',
    actions: [
      {
        type: 'MODIFY_STAT',
        target: 'self',
        stat: 'armor',
        value: 15,
        duration: 999,
      },
      {
        type: 'MODIFY_STAT',
        target: 'self',
        stat: 'attack',
        value: 5,
        duration: 999,
      },
    ],
  },
  {
    id: 'assassin',
    type: 'passive',
    actions: [
      {
        type: 'MODIFY_STAT',
        target: 'self',
        stat: 'dodge',
        value: 10,
        duration: 999,
      },
      {
        type: 'MODIFY_STAT',
        target: 'self',
        stat: 'crit',
        value: 15,
        duration: 999,
      },
    ],
  },
  {
    id: 'strong',
    type: 'passive',
    actions: [
      {
        type: 'MODIFY_STAT',
        target: 'self',
        stat: 'attack',
        value: 15,
        duration: 999,
      },
      {
        type: 'MODIFY_STAT',
        target: 'self',
        stat: 'crit',
        value: 5,
        duration: 999,
      },
    ],
  },
  {
    id: 'fanatic',
    type: 'passive',
    actions: [
      {
        type: 'MODIFY_STAT',
        target: 'self',
        stat: 'attack',
        value: 10,
        duration: 999,
      },
      {
        type: 'MODIFY_STAT',
        target: 'self',
        stat: 'hp',
        value: 15,
        duration: 999,
      },
      {
        type: 'MODIFY_STAT',
        target: 'self',
        stat: 'dodge',
        value: 5,
        duration: 999,
      },
    ],
  },
  {
    id: 'thorns',
    type: 'passive',
    actions: [
      {
        type: 'APPLY_STATUS',
        target: 'self',
        status: 'thorns',
        value: 30,
        duration: 999,
      },
    ],
  },
  {
    id: 'leech',
    type: 'passive',
    actions: [
      {
        type: 'APPLY_STATUS',
        target: 'self',
        status: 'leech',
        value: 30,
        duration: 999,
      },
    ],
  },
];

export const SKILLS: Skill[] = [
  ...BASE_SKILLS,
  ...ACTIVE_SKILLS,
  ...HEALING_SKILLS,
  ...PASSIVE_SKILLS,
];

export const NEGATIVE_EFFECTS: StatusEffectType[] = ['poison', 'bleed', 'stun'];

export const ARENA_EVENTS = {
  ...EVENTS,
  PLAYER_READY: 'arena:ready',
  USE_SKILL: 'arena:skill',
  GAME_UPDATE: 'arena:update',
} as const;
