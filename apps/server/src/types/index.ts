import type { Player } from '@game/shared/types';
import type { DefaultEventsMap, Socket } from 'socket.io';

export type AckFunc = (...args: unknown[]) => void;

export type SocketSessionData = {
  player: Player;
};

export type AppSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  SocketSessionData
>;
