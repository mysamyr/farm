import {
  ANIMALS,
  ANIMALS_WAGES,
  ROOM_STATES,
  TURN_START_INDEX,
  EVENTS,
} from '../../constants';

import { getAddedAnimalsCount, shuffleArray } from './game.helpers';

import type { DiceAnimals, TradableAnimals } from './game.types';
import type { Player } from '../player/player.types';
import type { Room } from '../room/room.types';
import type { Server } from 'socket.io';

export function winnerHandler(io: Server, room: Room, player: Player): void {
  room.state = ROOM_STATES.FINISHED;
  room.winner = player.id;
  io.to(room.id).emit(EVENTS.GAME_FINISHED, { winner: player });
}

export function applyExchange(
  player: Player,
  from: TradableAnimals,
  to: TradableAnimals
): void {
  const fromWage: number = ANIMALS_WAGES[from]!;
  const toWage: number = ANIMALS_WAGES[to]!;

  if (fromWage < toWage) {
    // Trade up
    player.animals[from]! -= toWage / fromWage;
    player.animals[to]! += 1;
  } else if (fromWage === toWage) {
    // Exchange for Dogs
    player.animals[from]! -= 1;
    player.animals[to]! += 1;
  } else {
    // Trade down
    player.animals[from]! -= 1;
    player.animals[to]! += fromWage / toWage;
  }
}

export function removePlayerFromOrder(room: Room, playerId: string): void {
  const idx: number = room.order.indexOf(playerId);
  room.order.splice(idx, 1);
  if (room.turn >= room.order.length) {
    room.turn = TURN_START_INDEX;
  }
}

export function setOrder(room: Room): void {
  room.order = shuffleArray([...room.players.keys()]);
}

export function setNextTurn(room: Room): void {
  room.turn = (room.turn + 1) % room.order.length;
}

export function applyDiceResult(
  room: Room,
  player: Player,
  diceResult: [DiceAnimals, DiceAnimals]
): void {
  const tempStore = new Map<
    Exclude<DiceAnimals, ANIMALS.FOX | ANIMALS.BEAR>,
    number
  >();
  for (const animal of diceResult) {
    if (animal === ANIMALS.FOX) {
      if (player.animals[ANIMALS.SMALL_DOG]) {
        player.animals[ANIMALS.SMALL_DOG] -= 1;
        continue;
      }
      player.animals[ANIMALS.DUCK] = 0;
      player.animals[ANIMALS.GOAT] = 0;
      continue;
    }
    if (animal === ANIMALS.BEAR) {
      if (player.animals[ANIMALS.BIG_DOG]) {
        player.animals[ANIMALS.BIG_DOG] -= 1;
        continue;
      }
      player.animals[ANIMALS.PIG] = 0;
      player.animals[ANIMALS.HORSE] = 0;
      continue;
    }
    tempStore.set(animal, (tempStore.get(animal) || 0) + 1);
  }
  [...tempStore.keys()].forEach((i: string): void => {
    const animal = i as Exclude<DiceAnimals, ANIMALS.FOX | ANIMALS.BEAR>;
    const rolled: number = tempStore.get(
      animal as Exclude<DiceAnimals, ANIMALS.FOX | ANIMALS.BEAR>
    )!;

    const have: number = player.animals[animal];
    const add: number = Math.floor((have + rolled) / 2);
    player.animals[animal] =
      have +
      getAddedAnimalsCount(
        Array.from(room.players.values()),
        room.rules,
        animal,
        add
      );
  });
}
