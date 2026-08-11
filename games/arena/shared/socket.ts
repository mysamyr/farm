import type { GameActionPayload } from '@game/shared/types';

import type { SkillId } from './constants.js';

export type ArenaGameAction =
  | { type: 'PLAYER_READY'; skills: SkillId[] }
  | { type: 'USE_SKILL'; skill: SkillId; target: string };

export type ArenaGameActionPayload = GameActionPayload<ArenaGameAction>;
