import { ERROR, EVENTS, NOTIFICATION_TYPES } from '@game/shared/constants';
import { EMOTES, FARM_EVENTS } from '@game/shared/constants/farm';
import {
  GameExchangePayload,
  RollDiceAck,
  RoomIdPayload,
  SendEmotePayload,
  TradeCancelPayload,
  TradeConfirmPayload,
  TradeLockPayload,
  TradeStartPayload,
  TradeUpdatePayload,
} from '@game/shared/types';
import type { Room } from '@game/shared/types/farm';

import { LogLevel } from '../../constants';
import { getRoomById } from '../../features/room/room.service';
import { log } from '../../services/logger';

import type { AckFunc, AppServer, AppSocket } from '../../types';

import {
  isEnoughCardsToExchange,
  checkWinner,
  isExchangeForbidden,
  isTradeAllowed,
  rollDice,
  areLimitedCards,
  validateTradeOffer,
} from './helpers';
import {
  applyDiceResult,
  applyExchange,
  applyTrade,
  checkPlayerAction,
  setNextTurn,
  winnerHandler,
} from './service';

const rollDiceHandler =
  (io: AppServer, socket: AppSocket) =>
  (req: RoomIdPayload, ack?: AckFunc<RollDiceAck>): void => {
    const { roomId } = req;
    log(LogLevel.DEBUG, 'event:game:rollDice', {
      socketId: socket.id,
      roomId,
    });

    const room = getRoomById(roomId) as Room;
    const res = checkPlayerAction(room, socket.id);
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
      winnerHandler(io, activeRoom, player);
    } else {
      setNextTurn(activeRoom);
    }

    activeRoom.dice = dice;
    io.to(activeRoom.id).emit(FARM_EVENTS.GAME_UPDATE, {
      room: activeRoom,
    });
    ack?.({ ok: true, diceResult: dice });
  };

const exchangeHandler =
  (io: AppServer, socket: AppSocket) =>
  (req: GameExchangePayload, ack?: AckFunc): void => {
    const { roomId, from, to } = req;
    log(LogLevel.DEBUG, 'event:game:exchange', {
      socketId: socket.id,
      ...req,
    });

    const room = getRoomById(roomId) as Room;
    const res = checkPlayerAction(room, socket.id);
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
      winnerHandler(io, activeRoom, player);
    }

    io.to(activeRoom.id).emit(FARM_EVENTS.GAME_UPDATE, { room: activeRoom });
    ack?.({ ok: true });
  };

const sendEmoteHandler =
  (io: AppServer, socket: AppSocket) =>
  (req: SendEmotePayload, ack?: AckFunc): void => {
    const { roomId, emoteId } = req;
    log(LogLevel.DEBUG, 'event:game:sendEmote', {
      socketId: socket.id,
      roomId,
      emoteId,
    });

    const room = getRoomById(roomId) as Room;
    if (!room) {
      ack?.({ ok: false, error: ERROR.ROOM_NOT_FOUND });
      return;
    }

    const player = room.players.find(p => p.id === socket.id);
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
    const lastEmoteSendTime = socket.data.lastEmoteSendTime || 0;
    const timeSinceLastEmote = now - lastEmoteSendTime;

    if (timeSinceLastEmote < 5000) {
      ack?.({ ok: false, error: ERROR.THROTTLED });
      return;
    }

    socket.data.lastEmoteSendTime = now;

    io.to(room.id).emit(FARM_EVENTS.GAME_EMOTE_SENT, {
      emoteId,
      playerName: player.name,
    });

    ack?.({ ok: true });
    log(LogLevel.DEBUG, 'game:emoteSent', {
      roomId,
      emoteId,
      playerName: player.name,
    });
  };

const tradeStartHandler =
  (io: AppServer, socket: AppSocket) =>
  (req: TradeStartPayload, ack?: AckFunc): void => {
    const { roomId, targetPlayerId } = req;
    log(LogLevel.DEBUG, 'event:game:tradeStart', {
      socketId: socket.id,
      roomId,
      targetPlayerId,
    });

    const room = getRoomById(roomId) as Room;
    const res = checkPlayerAction(room, socket.id);
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
    if (targetPlayerId === socket.id) {
      ack?.({ ok: false, error: ERROR.INVALID_TRADE_TARGET });
      return;
    }
    const target = activeRoom.players.find(p => p.id === targetPlayerId);
    if (!target) {
      ack?.({ ok: false, error: ERROR.INVALID_TRADE_TARGET });
      return;
    }

    activeRoom.trade = {
      initiatorId: socket.id,
      targetId: targetPlayerId,
      locked: {},
      offers: {},
    };

    io.to(activeRoom.id).emit(FARM_EVENTS.GAME_UPDATE, { room: activeRoom });
    ack?.({ ok: true });
  };

const tradeUpdateHandler =
  (io: AppServer, socket: AppSocket) =>
  (req: TradeUpdatePayload, ack?: AckFunc): void => {
    const { roomId, offer } = req;
    log(LogLevel.DEBUG, 'event:game:tradeUpdate', {
      socketId: socket.id,
      roomId,
    });

    const room = getRoomById(roomId) as Room;
    if (!room) {
      ack?.({ ok: false, error: ERROR.ROOM_NOT_FOUND });
      return;
    }
    if (!room.trade) {
      ack?.({ ok: false, error: ERROR.TRADE_NOT_ACTIVE });
      return;
    }

    const isParticipant =
      socket.id === room.trade.initiatorId || socket.id === room.trade.targetId;
    if (!isParticipant) {
      ack?.({ ok: false, error: ERROR.PLAYER_NOT_FOUND });
      return;
    }

    const player = room.players.find(p => p.id === socket.id);
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
    room.trade.offers[socket.id] = offer;

    io.to(room.id).emit(FARM_EVENTS.GAME_UPDATE, { room });
    ack?.({ ok: true });
  };

const tradeLockHandler =
  (io: AppServer, socket: AppSocket) =>
  (req: TradeLockPayload, ack?: AckFunc): void => {
    const { roomId } = req;
    log(LogLevel.DEBUG, 'event:game:tradeLock', {
      socketId: socket.id,
      roomId,
    });

    const room = getRoomById(roomId) as Room;
    if (!room) {
      ack?.({ ok: false, error: ERROR.ROOM_NOT_FOUND });
      return;
    }
    if (!room.trade) {
      ack?.({ ok: false, error: ERROR.TRADE_NOT_ACTIVE });
      return;
    }

    const isParticipant =
      socket.id === room.trade.initiatorId || socket.id === room.trade.targetId;
    if (!isParticipant) {
      ack?.({ ok: false, error: ERROR.PLAYER_NOT_FOUND });
      return;
    }

    room.trade.locked[socket.id] = true;

    io.to(room.id).emit(FARM_EVENTS.GAME_UPDATE, { room });
    ack?.({ ok: true });
  };

const tradeConfirmHandler =
  (io: AppServer, socket: AppSocket) =>
  (req: TradeConfirmPayload, ack?: AckFunc): void => {
    const { roomId } = req;
    log(LogLevel.DEBUG, 'event:game:tradeConfirm', {
      socketId: socket.id,
      roomId,
    });

    const room = getRoomById(roomId) as Room;
    if (!room) {
      ack?.({ ok: false, error: ERROR.ROOM_NOT_FOUND });
      return;
    }
    if (!room.trade) {
      ack?.({ ok: false, error: ERROR.TRADE_NOT_ACTIVE });
      return;
    }

    const isParticipant =
      socket.id === room.trade.initiatorId || socket.id === room.trade.targetId;
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

    io.to(room.id).emit(FARM_EVENTS.GAME_UPDATE, { room });
    ack?.({ ok: true });
  };

const tradeCancelHandler =
  (io: AppServer, socket: AppSocket) =>
  (req: TradeCancelPayload, ack?: AckFunc): void => {
    const { roomId } = req;
    log(LogLevel.DEBUG, 'event:game:tradeCancel', {
      socketId: socket.id,
      roomId,
    });

    const room = getRoomById(roomId) as Room;
    if (!room) {
      ack?.({ ok: false, error: ERROR.ROOM_NOT_FOUND });
      return;
    }
    if (!room.trade) {
      ack?.({ ok: false, error: ERROR.TRADE_NOT_ACTIVE });
      return;
    }

    const isParticipant =
      socket.id === room.trade.initiatorId || socket.id === room.trade.targetId;
    if (!isParticipant) {
      ack?.({ ok: false, error: ERROR.PLAYER_NOT_FOUND });
      return;
    }

    const opponentId =
      socket.id === room.trade.initiatorId
        ? room.trade.targetId
        : room.trade.initiatorId;
    const canceller = room.players.find(p => p.id === socket.id);

    delete room.trade;

    io.to(opponentId).emit(EVENTS.NOTIFICATION, {
      type: NOTIFICATION_TYPES.TRADE_CANCELLED,
      data: canceller?.name || '',
    });

    io.to(room.id).emit(FARM_EVENTS.GAME_UPDATE, { room });
    ack?.({ ok: true });
  };

export function registerGameFeature(io: AppServer, socket: AppSocket): void {
  socket.on(FARM_EVENTS.GAME_ROLL_DICE, rollDiceHandler(io, socket));
  socket.on(FARM_EVENTS.GAME_EXCHANGE, exchangeHandler(io, socket));
  socket.on(FARM_EVENTS.GAME_SEND_EMOTE, sendEmoteHandler(io, socket));
  socket.on(FARM_EVENTS.GAME_TRADE_START, tradeStartHandler(io, socket));
  socket.on(FARM_EVENTS.GAME_TRADE_UPDATE, tradeUpdateHandler(io, socket));
  socket.on(FARM_EVENTS.GAME_TRADE_LOCK, tradeLockHandler(io, socket));
  socket.on(FARM_EVENTS.GAME_TRADE_CONFIRM, tradeConfirmHandler(io, socket));
  socket.on(FARM_EVENTS.GAME_TRADE_CANCEL, tradeCancelHandler(io, socket));
}
