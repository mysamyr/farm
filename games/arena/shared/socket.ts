import type { RoomIdPayload } from '@game/shared/types';

import type { SKILLS } from './constants';

export type SkillId = (typeof SKILLS)[number]['id'];

export type UseSkillPayload = RoomIdPayload & {
  skill: SkillId;
  target: string; // playerId
};

export type PlayerReadyPayload = RoomIdPayload & {
  skills: Array<SkillId>;
};
