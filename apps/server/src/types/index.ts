import type { Player } from '@game/shared/types';
import type {
  ClientToServerEvents,
  SocketAck,
  ServerToClientEvents,
} from '@game/shared/types';
import type { DefaultEventsMap, Server, Socket } from 'socket.io';

export type AckFunc<TResponse extends SocketAck = SocketAck> = (
  response: TResponse
) => void;

export type SocketSessionData = {
  player: Player;
  lastEmoteSendTime?: number;
  userId?: string;
};

export type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  DefaultEventsMap,
  SocketSessionData
>;

export type AppServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  DefaultEventsMap,
  SocketSessionData
>;
