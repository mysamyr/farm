import { ROOM_STATES } from '@game/shared/constants';
import { ANIMALS, EMOTES, FARM_EVENTS } from '@game/shared/constants/farm';
import type { Room, SendEmoteReq } from '@game/shared/types/farm';
import type { RollDiceAck } from '@game/shared/types/socket';

import { LogLevel } from '../../constants';
import { canStartGame } from '../../features/room/room.helpers';
import { getRoomById, updateRoomsList } from '../../features/room/room.service';
import { log } from '../../services/logger';

import type { AckFunc, AppServer, AppSocket } from '../../types';

import {
  isEnoughCardsToExchange,
  checkWinner,
  getInitDuckValue,
  isExchangeForbidden,
  rollDice,
  areLimitedCards,
} from './helpers';
import {
  applyDiceResult,
  applyExchange,
  checkPlayerAction,
  setNextTurn,
  setOrder,
  winnerHandler,
} from './service';

import type { ExchangeReq, RollDiceReq, StartGameReq } from './types';

const startGameHandler =
  (io: AppServer, socket: AppSocket) =>
  (req: StartGameReq, ack?: AckFunc): void => {
    log(LogLevel.DEBUG, 'event:game:start', {
      socketId: socket.id,
      roomId: req.roomId,
    });

    const room = getRoomById(req.roomId) as Room;
    if (!room) {
      ack?.({ ok: false, error: 'ROOM_NOT_FOUND' });
      return;
    }
    if (room.ownerId !== socket.id) {
      ack?.({ ok: false, error: 'NOT_OWNER' });
      return;
    }
    if (!canStartGame(room)) {
      ack?.({ ok: false, error: 'CANNOT_START' });
      return;
    }

    room.state = ROOM_STATES.RUNNING;
    setOrder(room);
    // init animals
    room.players.forEach(player => {
      player.animals = {
        [ANIMALS.DUCK]: getInitDuckValue(room.rules),
        [ANIMALS.GOAT]: 0,
        [ANIMALS.PIG]: 0,
        [ANIMALS.HORSE]: 0,
        [ANIMALS.COW]: 0,
        [ANIMALS.SMALL_DOG]: 0,
        [ANIMALS.BIG_DOG]: 0,
      };
    });

    updateRoomsList(io);
    io.to(room.id).emit(FARM_EVENTS.GAME_STARTED, { room });
    ack?.({ ok: true });
    log(LogLevel.INFO, 'game:started', { room });
  };

const rollDiceHandler =
  (io: AppServer, socket: AppSocket) =>
  (req: RollDiceReq, ack?: AckFunc<RollDiceAck>): void => {
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
      dice,
    });
    ack?.({ ok: true, diceResult: dice });
  };

const exchangeHandler =
  (io: AppServer, socket: AppSocket) =>
  (req: ExchangeReq, ack?: AckFunc): void => {
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
      ack?.({ ok: false, error: 'EXCHANGE_IS_FORBIDDEN' });
      return;
    }
    if (!isEnoughCardsToExchange(player, from, to)) {
      ack?.({ ok: false, error: 'NOT_ENOUGH_CARDS' });
      return;
    }
    if (areLimitedCards(activeRoom, to)) {
      ack?.({ ok: false, error: 'LIMITED_CARDS_EXCEEDED' });
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
  (req: SendEmoteReq, ack?: AckFunc): void => {
    const { roomId, emoteId } = req;
    log(LogLevel.DEBUG, 'event:game:sendEmote', {
      socketId: socket.id,
      roomId,
      emoteId,
    });

    const room = getRoomById(roomId) as Room;
    if (!room) {
      ack?.({ ok: false, error: 'ROOM_NOT_FOUND' });
      return;
    }

    const player = room.players.find(p => p.id === socket.id);
    if (!player) {
      ack?.({ ok: false, error: 'PLAYER_NOT_FOUND' });
      return;
    }

    const isKnownEmote = EMOTES.some(emote => emote.id === emoteId);
    if (!isKnownEmote) {
      ack?.({ ok: false, error: 'UNKNOWN_EMOTE' });
      return;
    }

    const now = Date.now();
    const lastEmoteSendTime = socket.data.lastEmoteSendTime || 0;
    const timeSinceLastEmote = now - lastEmoteSendTime;

    if (timeSinceLastEmote < 5000) {
      ack?.({ ok: false, error: 'THROTTLED' });
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

export function registerGameFeature(io: AppServer): void {
  io.on(FARM_EVENTS.CONNECTION, (socket: AppSocket): void => {
    socket.on(FARM_EVENTS.GAME_START, startGameHandler(io, socket));
    socket.on(FARM_EVENTS.GAME_ROLL_DICE, rollDiceHandler(io, socket));
    socket.on(FARM_EVENTS.GAME_EXCHANGE, exchangeHandler(io, socket));
    socket.on(FARM_EVENTS.GAME_SEND_EMOTE, sendEmoteHandler(io, socket));
  });
}
