import type { GameActionPayload } from '@game/shared/types';

import type { SKILLS } from './constants.js';

export type SkillId = (typeof SKILLS)[number]['id'];

export type ArenaGameAction =
  | { type: 'PLAYER_READY'; skills: SkillId[] }
  | { type: 'USE_SKILL'; skill: SkillId; target: string };

export type ArenaGameActionPayload = GameActionPayload<ArenaGameAction>;
