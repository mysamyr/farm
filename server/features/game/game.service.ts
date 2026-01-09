import {
  ANIMALS,
  ANIMALS_WAGES,
  ROOM_STATES,
  TURN_START_INDEX,
} from '../../constants';

import { getInitDuckValue, shuffleArray } from './game.helpers';

import type { DiceAnimals, TradableAnimals } from './game.types';
import type { Player } from '../player/player.types';
import type { Room, Rules } from '../room/room.types';
import type { Server } from 'socket.io';

export function winnerHandler(io: Server, room: Room, player: Player): void {
  room.state = ROOM_STATES.FINISHED;
  room.winner = player.name;
  io.to(room.id).emit('game:finished', { winner: player });
}

export function applyExchange(
  player: Player,
  from: TradableAnimals,
  to: TradableAnimals,
  count: number
): void {
  const fromWage: number = ANIMALS_WAGES[from]!;
  const toWage: number = ANIMALS_WAGES[to]!;

  if (fromWage < toWage) {
    // Trade up
    player.animals[from]! -= (toWage / fromWage) * count;
    player.animals[to]! += count;
  } else if (fromWage === toWage) {
    // Exchange for Dogs
    player.animals[from]! -= count;
    player.animals[to]! += count;
  } else {
    // Trade down
    player.animals[from]! -= count;
    player.animals[to]! += (fromWage / toWage) * count;
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
  rules: Rules,
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
      player.animals[ANIMALS.DUCK] = getInitDuckValue(rules);
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
    player.animals[animal] = have + add;
  });
}
