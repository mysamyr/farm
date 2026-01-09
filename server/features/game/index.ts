import { ANIMALS, EVENTS, ROOM_STATES } from '../../constants';
import { log } from '../../services/logger';
import { canStartGame, serializeRoom } from '../room/room.helpers';
import { getRoomById, updateRoomsList } from '../room/room.service';

import {
  isEnoughCardsToExchange,
  checkWinner,
  getCurrentPlayerTurnId,
  getInitDuckValue,
  isExchangeForbidden,
  rollDice,
  areLimitedCards,
} from './game.helpers';
import {
  applyDiceResult,
  applyExchange,
  setNextTurn,
  setOrder,
  winnerHandler,
} from './game.service';

import type { ExchangeReq, RollDiceReq, StartGameReq } from './game.types';
import type { AckFunc } from '../../types';
import type { Player } from '../player/player.types';
import type { Server, Socket } from 'socket.io';

const startGameHandler =
  (io: Server, socket: Socket) =>
  (req: StartGameReq, ack?: AckFunc): void => {
    log('debug', 'event:game:start', {
      socketId: socket.id,
      roomId: req.roomId,
    });

    const room = getRoomById(req.roomId);
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
    room.players.forEach((player: Player): void => {
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
    io.to(room.id).emit(EVENTS.GAME_STARTED, { room: serializeRoom(room) });
    ack?.({ ok: true });
    log('info', 'game:started', { room });
  };

const rollDiceHandler =
  (io: Server, socket: Socket) =>
  (req: RollDiceReq, ack?: AckFunc): void => {
    log('debug', 'event:game:rollDice', {
      socketId: socket.id,
      roomId: req.roomId,
    });

    const room = getRoomById(req.roomId);
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

    const player = room.players.get(socket.id);
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
    }

    room.dice = dice;
    setNextTurn(room);
    io.to(room.id).emit(EVENTS.GAME_UPDATE, {
      room: serializeRoom(room),
      dice,
    });
    ack?.({ ok: true, diceResult: dice });
  };

const exchangeHandler =
  (io: Server, socket: Socket) =>
  (req: ExchangeReq, ack?: AckFunc): void => {
    const { roomId, from, to } = req;
    log('debug', 'event:game:exchange', {
      socketId: socket.id,
      ...req,
    });

    const room = getRoomById(roomId);
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

    const player = room.players.get(socket.id);
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

    io.to(room.id).emit(EVENTS.GAME_UPDATE, { room: serializeRoom(room) });
    ack?.({ ok: true });
  };

export function registerGameFeature(io: Server): void {
  io.on('connection', (socket: Socket): void => {
    socket.on(EVENTS.GAME_START, startGameHandler(io, socket));
    socket.on(EVENTS.GAME_ROLL_DICE, rollDiceHandler(io, socket));
    socket.on(EVENTS.GAME_EXCHANGE, exchangeHandler(io, socket));
  });
}
