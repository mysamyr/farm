import { ERROR, ROOM_STATES } from '@game/shared/constants';
import {
  ARENA_EVENTS,
  DEFAULT_PLAYER_STATS,
} from '@game/shared/constants/arena';
import type { Room } from '@game/shared/types/arena';
import type {
  PlayerReadyPayload,
  UseSkillPayload,
} from '@game/shared/types/arena/socket';

import { LogLevel } from '../../constants';
import { getRoomById } from '../../features/room/room.service';
import { log } from '../../services/logger';
import type { AckFunc, AppServer, AppSocket } from '../../types';

import {
  isValidSkillSelection,
  getActivePlayer,
  getSkillById,
  getOpponent,
  isStunned,
} from './helpers';
import {
  applySkillSelection,
  processPlayerTurn,
  winnerHandler,
} from './service';

const playerReadyHandler =
  (io: AppServer, socket: AppSocket) =>
  (req: PlayerReadyPayload, ack?: AckFunc): void => {
    const { roomId, skills } = req;
    log(LogLevel.DEBUG, 'event:arena:playerReady', {
      socketId: socket.id,
      roomId,
    });

    const room = getRoomById(roomId) as Room;
    if (!room) {
      ack?.({ ok: false, error: ERROR.ROOM_NOT_FOUND });
      return;
    }
    if (room.state !== ROOM_STATES.RUNNING) {
      ack?.({ ok: false, error: ERROR.GAME_NOT_RUNNING });
      return;
    }

    const player = room.players.find(p => p.id === socket.id);
    if (!player) {
      ack?.({ ok: false, error: ERROR.PLAYER_NOT_FOUND });
      return;
    }
    if (player.ready) {
      ack?.({ ok: false });
      return;
    }

    if (!isValidSkillSelection(skills)) {
      ack?.({ ok: false });
      return;
    }

    player.ready = true;
    player.hp = DEFAULT_PLAYER_STATS.hp;
    applySkillSelection(player, skills);

    io.to(room.id).emit(ARENA_EVENTS.GAME_UPDATE, { room });
    ack?.({ ok: true });
  };

const useSkillHandler =
  (io: AppServer, socket: AppSocket) =>
  (req: UseSkillPayload, ack?: AckFunc): void => {
    const { roomId, skill: skillId } = req;
    log(LogLevel.DEBUG, 'event:arena:useSkill', {
      socketId: socket.id,
      roomId,
      skillId,
    });

    const room = getRoomById(roomId) as Room;
    if (!room) {
      ack?.({ ok: false, error: ERROR.ROOM_NOT_FOUND });
      return;
    }
    if (room.state !== ROOM_STATES.RUNNING) {
      ack?.({ ok: false, error: ERROR.GAME_NOT_RUNNING });
      return;
    }

    const player = getActivePlayer(room);
    if (!player || player.id !== socket.id) {
      ack?.({ ok: false, error: ERROR.NOT_YOUR_TURN });
      return;
    }

    if (isStunned(player) && skillId !== 'skip') {
      ack?.({ ok: false });
      return;
    }

    const skill = getSkillById(skillId);
    if (!skill || (skill.type !== 'active' && skill.type !== 'healing')) {
      ack?.({ ok: false });
      return;
    }

    const playerSkill = player.skills.find(s => s.id === skillId);
    if (!playerSkill || playerSkill.cooldown > 0) {
      ack?.({ ok: false });
      return;
    }

    const { dead } = processPlayerTurn(room, skillId);

    if (dead === 'attacker') {
      const opponent = getOpponent(room, player.id)!;
      winnerHandler(io, room, opponent);
    } else if (dead === 'defender') {
      winnerHandler(io, room, player);
    }

    io.to(room.id).emit(ARENA_EVENTS.GAME_UPDATE, { room });
    ack?.({ ok: true });
  };

export function registerGameFeature(io: AppServer, socket: AppSocket): void {
  socket.on(ARENA_EVENTS.PLAYER_READY, playerReadyHandler(io, socket));
  socket.on(ARENA_EVENTS.USE_SKILL, useSkillHandler(io, socket));
}
