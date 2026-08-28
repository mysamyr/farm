import {
  EVENTS,
  REMATCH_TIMEOUT_MS,
  ROOM_STATES,
} from '@game/shared/constants';
import type { BaseRoom } from '@game/shared/types';

import { LogLevel } from '../../constants/index.js';
import { gameRegistry } from '../../games/registry.js';
import { log } from '../../services/logger.js';
import type { AppServer } from '../../types/index.js';

import { getRoomById, listRooms } from './room.store.js';

const rematchTimers = new Map<string, ReturnType<typeof setTimeout>>();

export function clearRematchTimer(roomId: string): void {
  const timer = rematchTimers.get(roomId);
  if (timer) {
    clearTimeout(timer);
    rematchTimers.delete(roomId);
  }
}

function broadcastRoom(io: AppServer, room: BaseRoom): void {
  io.to(room.id).emit(EVENTS.GAME_STATE_UPDATE, { state: room });
  io.emit(EVENTS.ROOMS_LIST, listRooms());
}

function areAllPresentReady(room: BaseRoom): boolean {
  if (!room.vote || room.players.length === 0) {
    return false;
  }
  return room.players.every(player =>
    room.vote!.readyPlayerIds.includes(player.id)
  );
}

export function startRoomGame(io: AppServer, room: BaseRoom): void {
  clearRematchTimer(room.id);
  delete room.vote;
  delete room.winner;
  room.state = ROOM_STATES.RUNNING;
  room.startedAt = Date.now();

  gameRegistry.get(room.game).onGameStart?.(io, room);

  io.emit(EVENTS.ROOMS_LIST, listRooms());
  io.to(room.id).emit(EVENTS.GAME_STARTED, { room });
  log(LogLevel.INFO, 'game:started', { room });
}

export function returnRoomToLobby(io: AppServer, room: BaseRoom): void {
  clearRematchTimer(room.id);
  delete room.vote;
  delete room.winner;
  delete room.startedAt;
  room.state = ROOM_STATES.IDLE;
  broadcastRoom(io, room);
  log(LogLevel.INFO, 'room:returned-to-lobby', { roomId: room.id });
}

export function beginPreGameVote(io: AppServer, room: BaseRoom): void {
  if (room.state !== ROOM_STATES.IDLE) {
    return;
  }
  if (room.vote) {
    return;
  }

  room.vote = {
    readyPlayerIds: [room.ownerId],
  };

  const minPlayers = gameRegistry.getConfig(room.game).minPlayers;
  if (areAllPresentReady(room) && room.players.length >= minPlayers) {
    startRoomGame(io, room);
    return;
  }

  broadcastRoom(io, room);
}

export function beginMidGameVote(io: AppServer, room: BaseRoom): void {
  if (room.state !== ROOM_STATES.RUNNING) {
    return;
  }
  if (room.vote) {
    return;
  }

  const minPlayers = gameRegistry.getConfig(room.game).minPlayers;
  if (room.players.length < minPlayers) {
    return;
  }

  room.vote = {
    expiresAt: Date.now() + REMATCH_TIMEOUT_MS,
    readyPlayerIds: [],
  };

  const timer = setTimeout(() => {
    rematchTimers.delete(room.id);
    const current = getRoomById(room.id);
    if (!current || current.state !== ROOM_STATES.RUNNING || !current.vote) {
      return;
    }
    delete current.vote;
    broadcastRoom(io, current);
  }, REMATCH_TIMEOUT_MS);
  rematchTimers.set(room.id, timer);

  broadcastRoom(io, room);
}

export function beginPostGame(io: AppServer, room: BaseRoom): void {
  if (room.state !== ROOM_STATES.FINISHED) {
    return;
  }

  clearRematchTimer(room.id);

  const minPlayers = gameRegistry.getConfig(room.game).minPlayers;
  const canRematch = room.players.length >= minPlayers;

  if (!canRematch) {
    delete room.vote;
    broadcastRoom(io, room);
    return;
  }

  room.vote = {
    readyPlayerIds: [],
  };

  broadcastRoom(io, room);
}

export function voteRematch(
  io: AppServer,
  room: BaseRoom,
  playerId: string
): boolean {
  if (!room.vote) {
    return false;
  }
  if (!room.players.some(player => player.id === playerId)) {
    return false;
  }

  if (!room.vote.readyPlayerIds.includes(playerId)) {
    room.vote.readyPlayerIds.push(playerId);
  }

  const minPlayers = gameRegistry.getConfig(room.game).minPlayers;
  if (areAllPresentReady(room) && room.players.length >= minPlayers) {
    startRoomGame(io, room);
    return true;
  }

  broadcastRoom(io, room);
  return true;
}

/** Clears an in-progress vote for IDLE (pre-game) or RUNNING (mid-game) rooms. */
export function declineVote(
  io: AppServer,
  room: BaseRoom,
  playerId: string
): boolean {
  if (
    (room.state !== ROOM_STATES.RUNNING && room.state !== ROOM_STATES.IDLE) ||
    !room.vote
  ) {
    return false;
  }
  if (!room.players.some(player => player.id === playerId)) {
    return false;
  }

  clearRematchTimer(room.id);
  delete room.vote;
  broadcastRoom(io, room);
  return true;
}

export function onPlayerLeftDuringRematch(
  io: AppServer,
  room: BaseRoom,
  playerId: string
): void {
  if (
    (room.state !== ROOM_STATES.FINISHED &&
      room.state !== ROOM_STATES.RUNNING &&
      room.state !== ROOM_STATES.IDLE) ||
    !room.vote
  ) {
    return;
  }

  room.vote.readyPlayerIds = room.vote.readyPlayerIds.filter(
    id => id !== playerId
  );

  if (!room.players.length) {
    clearRematchTimer(room.id);
    return;
  }

  const minPlayers = gameRegistry.getConfig(room.game).minPlayers;
  if (room.players.length < minPlayers) {
    clearRematchTimer(room.id);
    if (room.state === ROOM_STATES.FINISHED) {
      returnRoomToLobby(io, room);
      return;
    }
    delete room.vote;
    broadcastRoom(io, room);
    return;
  }

  if (areAllPresentReady(room)) {
    startRoomGame(io, room);
    return;
  }

  broadcastRoom(io, room);
}

export function remapRematchPlayerId(
  room: BaseRoom,
  oldId: string,
  newId: string
): void {
  if (!room.vote) {
    return;
  }
  room.vote.readyPlayerIds = room.vote.readyPlayerIds.map(id =>
    id === oldId ? newId : id
  );
}
