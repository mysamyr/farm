import { ROOM_STATES } from '@shared/constants';
import { ANIMALS, FARM_EVENTS } from '@shared/constants/farm';

import { LogLevel } from '../../constants';
import { canStartGame } from '../../core/features/room/room.helpers';
import {
  getRoomById,
  updateRoomsList,
} from '../../core/features/room/room.service';
import { log } from '../../core/services/logger';

import {
  isEnoughCardsToExchange,
  checkWinner,
  getCurrentPlayerTurnId,
  getInitDuckValue,
  isExchangeForbidden,
  rollDice,
  areLimitedCards,
} from './helpers';
import {
  applyDiceResult,
  applyExchange,
  setNextTurn,
  setOrder,
  winnerHandler,
} from './service';

import type { ExchangeReq, RollDiceReq, StartGameReq } from './types';
import type { AckFunc } from '../../types';
import type { Room } from '@shared/types/farm';
import type { Server, Socket } from 'socket.io';

const startGameHandler =
  (io: Server, socket: Socket) =>
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
  (io: Server, socket: Socket) =>
  (req: RollDiceReq, ack?: AckFunc): void => {
    log(LogLevel.DEBUG, 'event:game:rollDice', {
      socketId: socket.id,
      roomId: req.roomId,
    });

    const room = getRoomById(req.roomId) as Room;
    if (!room) {
      ack?.({ ok: false, error: 'ROOM_NOT_FOUND' });
      return;
    }
    if (room.state !== ROOM_STATES.RUNNING) {
      ack?.({ ok: false, error: 'GAME_NOT_RUNNING' });
      return;
    }
    if (getCurrentPlayerTurnId(room) !== socket.id) {
      ack?.({ ok: false, error: 'NOT_YOUR_TURN' });
      return;
    }

    const player = room.players.find(p => p.id === socket.id);
    if (!player) {
      ack?.({ ok: false, error: 'PLAYER_NOT_FOUND' });
      return;
    }

    const dice = rollDice();
    applyDiceResult(room, player, dice);

    player.exchangedThisTurn = false;

    const winner = checkWinner(player);
    if (winner) {
      winnerHandler(io, room, player);
    } else {
      setNextTurn(room);
    }

    room.dice = dice;
    io.to(room.id).emit(FARM_EVENTS.GAME_UPDATE, {
      room,
      dice,
    });
    ack?.({ ok: true, diceResult: dice });
  };

const exchangeHandler =
  (io: Server, socket: Socket) =>
  (req: ExchangeReq, ack?: AckFunc): void => {
    const { roomId, from, to } = req;
    log(LogLevel.DEBUG, 'event:game:exchange', {
      socketId: socket.id,
      ...req,
    });

    const room = getRoomById(roomId) as Room;
    if (!room) {
      ack?.({ ok: false, error: 'ROOM_NOT_FOUND' });
      return;
    }
    if (room.state !== ROOM_STATES.RUNNING) {
      ack?.({ ok: false, error: 'GAME_NOT_RUNNING' });
      return;
    }
    if (getCurrentPlayerTurnId(room) !== socket.id) {
      ack?.({ ok: false, error: 'NOT_YOUR_TURN' });
      return;
    }

    const player = room.players.find(p => p.id === socket.id);
    if (!player) {
      ack?.({ ok: false, error: 'PLAYER_NOT_FOUND' });
      return;
    }

    if (isExchangeForbidden(room, player)) {
      ack?.({ ok: false, error: 'EXCHANGE_IS_FORBIDDEN' });
      return;
    }
    if (!isEnoughCardsToExchange(player, from, to)) {
      ack?.({ ok: false, error: 'NOT_ENOUGH_CARDS' });
      return;
    }
    if (areLimitedCards(room, to)) {
      ack?.({ ok: false, error: 'LIMITED_CARDS_EXCEEDED' });
      return;
    }

    applyExchange(player, from, to);

    player.exchangedThisTurn = true;

    const winner = checkWinner(player);
    if (winner) {
      winnerHandler(io, room, player);
    }

    io.to(room.id).emit(FARM_EVENTS.GAME_UPDATE, { room });
    ack?.({ ok: true });
  };

export function registerGameFeature(io: Server): void {
  io.on(FARM_EVENTS.CONNECTION, (socket: Socket): void => {
    socket.on(FARM_EVENTS.GAME_START, startGameHandler(io, socket));
    socket.on(FARM_EVENTS.GAME_ROLL_DICE, rollDiceHandler(io, socket));
    socket.on(FARM_EVENTS.GAME_EXCHANGE, exchangeHandler(io, socket));
  });
}
