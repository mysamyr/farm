import { ERROR } from '@game/shared/constants';
import { EMOTES, FARM_EVENTS } from '@game/shared/constants/farm';
import {
  GameExchangePayload,
  RollDiceAck,
  RoomIdPayload,
  SendEmotePayload,
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
  rollDice,
  areLimitedCards,
} from './helpers';
import {
  applyDiceResult,
  applyExchange,
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

export function registerGameFeature(io: AppServer, socket: AppSocket): void {
  socket.on(FARM_EVENTS.GAME_ROLL_DICE, rollDiceHandler(io, socket));
  socket.on(FARM_EVENTS.GAME_EXCHANGE, exchangeHandler(io, socket));
  socket.on(FARM_EVENTS.GAME_SEND_EMOTE, sendEmoteHandler(io, socket));
}
