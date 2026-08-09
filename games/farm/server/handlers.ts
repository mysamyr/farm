// Farm Game - Socket Event Handlers
import { ERROR, EVENTS } from '@game/shared/constants';
import type { GameHandlerContext } from '@game/shared/engine';
import type { RoomIdPayload, SocketAck } from '@game/shared/types';

import {
  EMOTES,
  FARM_EVENTS,
  FARM_NOTIFICATION_TYPES,
  type GameExchangePayload,
  type Player,
  type RollDiceAck,
  type Room,
  type SendEmotePayload,
  type TradeCancelPayload,
  type TradeConfirmPayload,
  type TradeLockPayload,
  type TradeStartPayload,
  type TradeUpdatePayload,
} from '../shared';

import {
  applyDiceResult,
  applyExchange,
  applyTrade,
  checkPlayerAction,
  markWinner,
  setNextTurn,
} from './engine';
import {
  areLimitedCards,
  checkWinner,
  isEnoughCardsToExchange,
  isExchangeForbidden,
  isTradeAllowed,
  rollDice,
  validateTradeOffer,
} from './helpers';

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
    type: 'GAME_FINISHED',
    data: player.name,
  });
}

type AckFunc<T extends SocketAck = SocketAck> = (response: T) => void;

const rollDiceHandler =
  (ctx: GameHandlerContext) =>
  (req: RoomIdPayload, ack?: AckFunc<RollDiceAck>): void => {
    const { roomId } = req;
    ctx.log('event:game:rollDice', { socketId: ctx.socketId, roomId });

    const room = ctx.getRoomById(roomId) as Room;
    const res = checkPlayerAction(room, ctx.socketId);
    if (!res.ok) {
      ack?.({ ok: false, error: res.error });
      return;
    }
    const { room: activeRoom, player } = res;

    if (activeRoom.trade) {
      ack?.({ ok: false, error: ERROR.TRADE_ALREADY_ACTIVE });
      return;
    }

    const dice = rollDice();
    applyDiceResult(activeRoom, player, dice);

    player.exchangedThisTurn = false;

    const winner = checkWinner(player);
    if (winner) {
      winnerHandler(ctx, activeRoom, player);
    } else {
      setNextTurn(activeRoom);
    }

    activeRoom.dice = dice;
    ctx.emitToRoom(activeRoom.id, FARM_EVENTS.GAME_UPDATE, {
      room: activeRoom,
    });
    ack?.({ ok: true, diceResult: dice });
  };

const exchangeHandler =
  (ctx: GameHandlerContext) =>
  (req: GameExchangePayload, ack?: AckFunc): void => {
    const { roomId, from, to } = req;
    ctx.log('event:game:exchange', { socketId: ctx.socketId, ...req });

    const room = ctx.getRoomById(roomId) as Room;
    const res = checkPlayerAction(room, ctx.socketId);
    if (!res.ok) {
      ack?.({ ok: false, error: res.error });
      return;
    }
    const { room: activeRoom, player } = res;

    if (isExchangeForbidden(activeRoom, player)) {
      ack?.({ ok: false, error: ERROR.EXCHANGE_IS_FORBIDDEN });
      return;
    }
    if (!isEnoughCardsToExchange(player, from, to)) {
      ack?.({ ok: false, error: ERROR.NOT_ENOUGH_CARDS });
      return;
    }
    if (areLimitedCards(activeRoom, to)) {
      ack?.({ ok: false, error: ERROR.LIMITED_CARDS_EXCEEDED });
      return;
    }

    applyExchange(player, from, to);
    player.exchangedThisTurn = true;

    const winner = checkWinner(player);
    if (winner) {
      winnerHandler(ctx, activeRoom, player);
    }

    ctx.emitToRoom(activeRoom.id, FARM_EVENTS.GAME_UPDATE, {
      room: activeRoom,
    });
    ack?.({ ok: true });
  };

const sendEmoteHandler =
  (ctx: GameHandlerContext) =>
  (req: SendEmotePayload, ack?: AckFunc): void => {
    const { roomId, emoteId } = req;
    ctx.log('event:game:sendEmote', {
      socketId: ctx.socketId,
      roomId,
      emoteId,
    });

    const room = ctx.getRoomById(roomId) as Room;
    if (!room) {
      ack?.({ ok: false, error: ERROR.ROOM_NOT_FOUND });
      return;
    }

    const player = room.players.find(p => p.id === ctx.socketId);
    if (!player) {
      ack?.({ ok: false, error: ERROR.PLAYER_NOT_FOUND });
      return;
    }

    const isKnownEmote = EMOTES.some(emote => emote.id === emoteId);
    if (!isKnownEmote) {
      ack?.({ ok: false, error: ERROR.UNKNOWN_EMOTE });
      return;
    }

    const now = Date.now();
    const lastEmoteSendTime =
      (ctx.getSocketData('lastEmoteSendTime') as number) || 0;
    if (now - lastEmoteSendTime < 5000) {
      ack?.({ ok: false, error: ERROR.THROTTLED });
      return;
    }

    ctx.setSocketData('lastEmoteSendTime', now);

    ctx.emitToRoom(room.id, FARM_EVENTS.GAME_EMOTE_SENT, {
      emoteId,
      playerName: player.name,
    });

    ack?.({ ok: true });
    ctx.log('game:emoteSent', { roomId, emoteId, playerName: player.name });
  };

const tradeStartHandler =
  (ctx: GameHandlerContext) =>
  (req: TradeStartPayload, ack?: AckFunc): void => {
    const { roomId, targetPlayerId } = req;
    ctx.log('event:game:tradeStart', {
      socketId: ctx.socketId,
      roomId,
      targetPlayerId,
    });

    const room = ctx.getRoomById(roomId) as Room;
    const res = checkPlayerAction(room, ctx.socketId);
    if (!res.ok) {
      ack?.({ ok: false, error: res.error });
      return;
    }
    const { room: activeRoom } = res;

    if (!isTradeAllowed(activeRoom)) {
      ack?.({ ok: false, error: ERROR.TRADE_NOT_ALLOWED });
      return;
    }
    if (activeRoom.trade) {
      ack?.({ ok: false, error: ERROR.TRADE_ALREADY_ACTIVE });
      return;
    }
    if (targetPlayerId === ctx.socketId) {
      ack?.({ ok: false, error: ERROR.INVALID_TRADE_TARGET });
      return;
    }
    const target = activeRoom.players.find(p => p.id === targetPlayerId);
    if (!target) {
      ack?.({ ok: false, error: ERROR.INVALID_TRADE_TARGET });
      return;
    }

    activeRoom.trade = {
      initiatorId: ctx.socketId,
      targetId: targetPlayerId,
      locked: {},
      offers: {},
    };

    ctx.emitToRoom(activeRoom.id, FARM_EVENTS.GAME_UPDATE, {
      room: activeRoom,
    });
    ack?.({ ok: true });
  };

const tradeUpdateHandler =
  (ctx: GameHandlerContext) =>
  (req: TradeUpdatePayload, ack?: AckFunc): void => {
    const { roomId, offer } = req;
    ctx.log('event:game:tradeUpdate', { socketId: ctx.socketId, roomId });

    const room = ctx.getRoomById(roomId) as Room;
    if (!room) {
      ack?.({ ok: false, error: ERROR.ROOM_NOT_FOUND });
      return;
    }
    if (!room.trade) {
      ack?.({ ok: false, error: ERROR.TRADE_NOT_ACTIVE });
      return;
    }

    const isParticipant =
      ctx.socketId === room.trade.initiatorId ||
      ctx.socketId === room.trade.targetId;
    if (!isParticipant) {
      ack?.({ ok: false, error: ERROR.PLAYER_NOT_FOUND });
      return;
    }

    const player = room.players.find(p => p.id === ctx.socketId);
    if (!player) {
      ack?.({ ok: false, error: ERROR.PLAYER_NOT_FOUND });
      return;
    }

    if (!validateTradeOffer(player, offer)) {
      ack?.({ ok: false, error: ERROR.NOT_ENOUGH_CARDS });
      return;
    }

    // Anti-fraud: any item update resets BOTH players' locked status
    room.trade.locked = {};
    room.trade.offers[ctx.socketId] = offer;

    ctx.emitToRoom(room.id, FARM_EVENTS.GAME_UPDATE, { room });
    ack?.({ ok: true });
  };

const tradeLockHandler =
  (ctx: GameHandlerContext) =>
  (req: TradeLockPayload, ack?: AckFunc): void => {
    const { roomId } = req;
    ctx.log('event:game:tradeLock', { socketId: ctx.socketId, roomId });

    const room = ctx.getRoomById(roomId) as Room;
    if (!room) {
      ack?.({ ok: false, error: ERROR.ROOM_NOT_FOUND });
      return;
    }
    if (!room.trade) {
      ack?.({ ok: false, error: ERROR.TRADE_NOT_ACTIVE });
      return;
    }

    const isParticipant =
      ctx.socketId === room.trade.initiatorId ||
      ctx.socketId === room.trade.targetId;
    if (!isParticipant) {
      ack?.({ ok: false, error: ERROR.PLAYER_NOT_FOUND });
      return;
    }

    room.trade.locked[ctx.socketId] = true;

    ctx.emitToRoom(room.id, FARM_EVENTS.GAME_UPDATE, { room });
    ack?.({ ok: true });
  };

const tradeConfirmHandler =
  (ctx: GameHandlerContext) =>
  (req: TradeConfirmPayload, ack?: AckFunc): void => {
    const { roomId } = req;
    ctx.log('event:game:tradeConfirm', { socketId: ctx.socketId, roomId });

    const room = ctx.getRoomById(roomId) as Room;
    if (!room) {
      ack?.({ ok: false, error: ERROR.ROOM_NOT_FOUND });
      return;
    }
    if (!room.trade) {
      ack?.({ ok: false, error: ERROR.TRADE_NOT_ACTIVE });
      return;
    }

    const isParticipant =
      ctx.socketId === room.trade.initiatorId ||
      ctx.socketId === room.trade.targetId;
    if (!isParticipant) {
      ack?.({ ok: false, error: ERROR.PLAYER_NOT_FOUND });
      return;
    }

    // Both players must be locked before confirming
    const bothLocked =
      room.trade.locked[room.trade.initiatorId] &&
      room.trade.locked[room.trade.targetId];
    if (!bothLocked) {
      ack?.({ ok: false, error: ERROR.TRADE_NOT_LOCKED });
      return;
    }

    // Re-verify both players still have the required animals
    const initiator = room.players.find(p => p.id === room.trade!.initiatorId);
    const target = room.players.find(p => p.id === room.trade!.targetId);

    if (
      !initiator ||
      !target ||
      !validateTradeOffer(
        initiator,
        room.trade.offers[room.trade.initiatorId] || {}
      ) ||
      !validateTradeOffer(target, room.trade.offers[room.trade.targetId] || {})
    ) {
      ack?.({ ok: false, error: ERROR.NOT_ENOUGH_CARDS });
      return;
    }

    // Atomic execution: transfer all animals in a single operation
    applyTrade(room);

    ctx.emitToRoom(room.id, FARM_EVENTS.GAME_UPDATE, { room });
    ack?.({ ok: true });
  };

const tradeCancelHandler =
  (ctx: GameHandlerContext) =>
  (req: TradeCancelPayload, ack?: AckFunc): void => {
    const { roomId } = req;
    ctx.log('event:game:tradeCancel', { socketId: ctx.socketId, roomId });

    const room = ctx.getRoomById(roomId) as Room;
    if (!room) {
      ack?.({ ok: false, error: ERROR.ROOM_NOT_FOUND });
      return;
    }
    if (!room.trade) {
      ack?.({ ok: false, error: ERROR.TRADE_NOT_ACTIVE });
      return;
    }

    const isParticipant =
      ctx.socketId === room.trade.initiatorId ||
      ctx.socketId === room.trade.targetId;
    if (!isParticipant) {
      ack?.({ ok: false, error: ERROR.PLAYER_NOT_FOUND });
      return;
    }

    const opponentId =
      ctx.socketId === room.trade.initiatorId
        ? room.trade.targetId
        : room.trade.initiatorId;
    const canceller = room.players.find(p => p.id === ctx.socketId);

    delete room.trade;

    ctx.emitToSocket(opponentId, EVENTS.NOTIFICATION, {
      type: FARM_NOTIFICATION_TYPES.TRADE_CANCELLED,
      data: canceller?.name || '',
    });

    ctx.emitToRoom(room.id, FARM_EVENTS.GAME_UPDATE, { room });
    ack?.({ ok: true });
  };

/**
 * Register all Farm game socket event handlers.
 */
export function registerHandlers(ctx: GameHandlerContext): void {
  ctx.on(FARM_EVENTS.GAME_ROLL_DICE, rollDiceHandler(ctx));
  ctx.on(FARM_EVENTS.GAME_EXCHANGE, exchangeHandler(ctx));
  ctx.on(FARM_EVENTS.GAME_SEND_EMOTE, sendEmoteHandler(ctx));
  ctx.on(FARM_EVENTS.GAME_TRADE_START, tradeStartHandler(ctx));
  ctx.on(FARM_EVENTS.GAME_TRADE_UPDATE, tradeUpdateHandler(ctx));
  ctx.on(FARM_EVENTS.GAME_TRADE_LOCK, tradeLockHandler(ctx));
  ctx.on(FARM_EVENTS.GAME_TRADE_CONFIRM, tradeConfirmHandler(ctx));
  ctx.on(FARM_EVENTS.GAME_TRADE_CANCEL, tradeCancelHandler(ctx));
}
