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
  if (!room.rematch || room.players.length === 0) {
    return false;
  }
  return room.players.every(player =>
    room.rematch!.readyPlayerIds.includes(player.id)
  );
}

export function startRoomGame(io: AppServer, room: BaseRoom): void {
  clearRematchTimer(room.id);
  delete room.rematch;
  delete room.winner;
  room.state = ROOM_STATES.RUNNING;

  gameRegistry.get(room.game).onGameStart?.(io, room);

  io.emit(EVENTS.ROOMS_LIST, listRooms());
  io.to(room.id).emit(EVENTS.GAME_STARTED, { room });
  log(LogLevel.INFO, 'game:started', { room });
}

export function returnRoomToLobby(io: AppServer, room: BaseRoom): void {
  clearRematchTimer(room.id);
  delete room.rematch;
  delete room.winner;
  room.state = ROOM_STATES.IDLE;
  broadcastRoom(io, room);
  log(LogLevel.INFO, 'room:returned-to-lobby', { roomId: room.id });
}

export function beginMidGameVote(io: AppServer, room: BaseRoom): void {
  if (room.state !== ROOM_STATES.RUNNING) {
    return;
  }
  if (room.rematch) {
    return;
  }

  const minPlayers = gameRegistry.getConfig(room.game).minPlayers;
  if (room.players.length < minPlayers) {
    return;
  }

  room.rematch = {
    expiresAt: Date.now() + REMATCH_TIMEOUT_MS,
    readyPlayerIds: [],
  };

  const timer = setTimeout(() => {
    rematchTimers.delete(room.id);
    const current = getRoomById(room.id);
    if (!current || current.state !== ROOM_STATES.RUNNING || !current.rematch) {
      return;
    }
    delete current.rematch;
    broadcastRoom(io, current);
  }, REMATCH_TIMEOUT_MS);
  rematchTimers.set(room.id, timer);

  broadcastRoom(io, room);
}

export function beginPostGame(io: AppServer, room: BaseRoom): void {
  if (room.state !== ROOM_STATES.FINISHED) {
    return;
  }
  if (rematchTimers.has(room.id)) {
    return;
  }

  const minPlayers = gameRegistry.getConfig(room.game).minPlayers;
  const canRematch = room.players.length >= minPlayers;

  if (!canRematch) {
    delete room.rematch;
    broadcastRoom(io, room);
    return;
  }

  if (!room.rematch) {
    room.rematch = {
      expiresAt: Date.now() + REMATCH_TIMEOUT_MS,
      readyPlayerIds: [],
    };
  }

  const delay = Math.max(0, room.rematch.expiresAt - Date.now());
  const timer = setTimeout(() => {
    rematchTimers.delete(room.id);
    const current = getRoomById(room.id);
    if (
      !current ||
      current.state !== ROOM_STATES.FINISHED ||
      !current.rematch
    ) {
      return;
    }
    returnRoomToLobby(io, current);
  }, delay);
  rematchTimers.set(room.id, timer);

  broadcastRoom(io, room);
}

export function voteRematch(
  io: AppServer,
  room: BaseRoom,
  playerId: string
): boolean {
  if (
    (room.state !== ROOM_STATES.FINISHED &&
      room.state !== ROOM_STATES.RUNNING) ||
    !room.rematch
  ) {
    return false;
  }
  if (!room.players.some(player => player.id === playerId)) {
    return false;
  }

  if (!room.rematch.readyPlayerIds.includes(playerId)) {
    room.rematch.readyPlayerIds.push(playerId);
  }

  const minPlayers = gameRegistry.getConfig(room.game).minPlayers;
  if (areAllPresentReady(room) && room.players.length >= minPlayers) {
    startRoomGame(io, room);
    return true;
  }

  broadcastRoom(io, room);
  return true;
}

export function declineMidGameRematchVote(
  io: AppServer,
  room: BaseRoom,
  playerId: string
): boolean {
  if (room.state !== ROOM_STATES.RUNNING || !room.rematch) {
    return false;
  }
  if (!room.players.some(player => player.id === playerId)) {
    return false;
  }

  clearRematchTimer(room.id);
  delete room.rematch;
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
      room.state !== ROOM_STATES.RUNNING) ||
    !room.rematch
  ) {
    return;
  }

  room.rematch.readyPlayerIds = room.rematch.readyPlayerIds.filter(
    id => id !== playerId
  );

  if (!room.players.length) {
    clearRematchTimer(room.id);
    return;
  }

  const minPlayers = gameRegistry.getConfig(room.game).minPlayers;
  if (room.players.length < minPlayers) {
    clearRematchTimer(room.id);
    delete room.rematch;
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
  if (!room.rematch) {
    return;
  }
  room.rematch.readyPlayerIds = room.rematch.readyPlayerIds.map(id =>
    id === oldId ? newId : id
  );
}
