import type { BasePlayer } from '@game/shared/types';
import type {
  CoreClientToServerEvents,
  CoreServerToClientEvents,
  SocketAck,
} from '@game/shared/types';
import type { DefaultEventsMap, Server, Socket } from 'socket.io';

export type AckFunc<TResponse extends SocketAck = SocketAck> = (
  response: TResponse
) => void;

type SocketSessionData = {
  player: BasePlayer;
  userId: string;
};

export type AppSocket = Socket<
  CoreClientToServerEvents,
  CoreServerToClientEvents,
  DefaultEventsMap,
  SocketSessionData
>;

export type AppServer = Server<
  CoreClientToServerEvents,
  CoreServerToClientEvents,
  DefaultEventsMap,
  SocketSessionData
>;
