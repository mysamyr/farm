import {
  ERROR,
  EVENTS,
  GameId,
  NOTIFICATION_TYPES,
  ROOM_STATES,
} from '@game/shared/constants';
import type { GameHandlerContext } from '@game/shared/engine';
import type { GameActionPayload, SocketAck } from '@game/shared/types';

import {
  type ArenaGameActionPayload,
  DEFAULT_PLAYER_STATS,
  type Player,
  type Room,
  SkillId,
  SkillType,
} from '../shared/index.js';

import {
  applySkillSelection,
  markWinner,
  processPlayerTurn,
} from './engine.js';
import {
  getActivePlayer,
  getOpponent,
  getSkillById,
  isStunned,
  isValidSkillSelection,
} from './helpers.js';

type AckFunc<T extends SocketAck = SocketAck> = (response: T) => void;

function winnerHandler(
  ctx: GameHandlerContext,
  room: Room,
  player: Player
): void {
  markWinner(room, player);
  ctx.log('game:finished', {
    roomId: room.id,
    winnerId: player.id,
    winnerName: player.name,
  });
  ctx.emitToRoom(room.id, EVENTS.NOTIFICATION, {
    type: NOTIFICATION_TYPES.GAME_FINISHED,
    data: player.name,
  });
}

const playerReadyHandler = (
  ctx: GameHandlerContext,
  req: Extract<ArenaGameActionPayload['action'], { type: 'PLAYER_READY' }> &
    Pick<ArenaGameActionPayload, 'roomId'>,
  ack?: AckFunc
): void => {
  const { roomId, skills } = req;
  ctx.log('event:arena:playerReady', { socketId: ctx.socketId, roomId });

  const room = ctx.getRoomById(roomId) as Room;
  if (!room) {
    ack?.({ ok: false, error: ERROR.ROOM_NOT_FOUND });
    return;
  }
  if (room.state !== ROOM_STATES.RUNNING) {
    ack?.({ ok: false, error: ERROR.GAME_NOT_RUNNING });
    return;
  }

  const player = room.players.find(p => p.id === ctx.socketId);
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

  ctx.emitToRoom(room.id, EVENTS.GAME_STATE_UPDATE, { state: room });
  ack?.({ ok: true });
};

const useSkillHandler = (
  ctx: GameHandlerContext,
  req: Extract<ArenaGameActionPayload['action'], { type: 'USE_SKILL' }> &
    Pick<ArenaGameActionPayload, 'roomId'>,
  ack?: AckFunc
): void => {
  const { roomId, skill: skillId } = req;
  ctx.log('event:arena:useSkill', {
    socketId: ctx.socketId,
    roomId,
    skillId,
  });

  const room = ctx.getRoomById(roomId) as Room;
  if (!room) {
    ack?.({ ok: false, error: ERROR.ROOM_NOT_FOUND });
    return;
  }
  if (room.state !== ROOM_STATES.RUNNING) {
    ack?.({ ok: false, error: ERROR.GAME_NOT_RUNNING });
    return;
  }

  const player = getActivePlayer(room);
  if (!player || player.id !== ctx.socketId) {
    ack?.({ ok: false, error: ERROR.NOT_YOUR_TURN });
    return;
  }

  if (isStunned(player) && skillId !== SkillId.skip) {
    ack?.({ ok: false });
    return;
  }

  const skill = getSkillById(skillId);
  if (
    !skill ||
    (skill.type !== SkillType.active && skill.type !== SkillType.healing)
  ) {
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
    winnerHandler(ctx, room, opponent);
  } else if (dead === 'defender') {
    winnerHandler(ctx, room, player);
  }

  ctx.emitToRoom(room.id, EVENTS.GAME_STATE_UPDATE, { state: room });
  ack?.({ ok: true });
};

/**
 * Handle Arena actions routed through the core game:action socket event.
 */
export function handleAction(
  ctx: GameHandlerContext,
  payload: GameActionPayload,
  ack?: AckFunc
): void {
  const room = ctx.getRoomById(payload.roomId) as Room | null;
  if (!room || room.game !== GameId.arena) {
    return;
  }

  const action = payload.action as ArenaGameActionPayload['action'];

  switch (action.type) {
    case 'PLAYER_READY':
      playerReadyHandler(
        ctx,
        {
          roomId: payload.roomId,
          ...action,
        },
        ack
      );
      break;
    case 'USE_SKILL':
      useSkillHandler(
        ctx,
        {
          roomId: payload.roomId,
          ...action,
        },
        ack
      );
      break;
  }
}
