import type { ARENA_EVENTS } from '../../constants/arena';

import type { RoomIdPayload, SocketAck } from '../index';

import type { Room, SkillId } from './index';

type RoomPayload = {
  room: Room;
};

export type UseSkillPayload = RoomIdPayload & {
  skill: SkillId;
  target: string; // playerId
};

export type PlayerReadyPayload = RoomIdPayload & {
  skills: Array<SkillId>;
};

export type ClientToServerEvents = {
  [ARENA_EVENTS.PLAYER_READY]: (
    payload: PlayerReadyPayload,
    ack?: (response: SocketAck) => void
  ) => void;
  [ARENA_EVENTS.USE_SKILL]: (
    payload: UseSkillPayload,
    ack?: (response: SocketAck) => void
  ) => void;
};

export type ServerToClientEvents = {
  [ARENA_EVENTS.GAME_UPDATE]: (payload: RoomPayload) => void;
};
