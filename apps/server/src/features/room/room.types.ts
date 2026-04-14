import type { Rules } from '@game/shared/types';

export type UpdateRoomReq = {
  roomId: string;
  rules?: Rules;
  name?: string;
};

export type JoinRoomReq = {
  roomId: string;
};

export type LeaveRoomReq = {
  roomId: string;
};

export type CloseRoomReq = {
  roomId: string;
};
