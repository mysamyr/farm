import { ROOM_STATES, EVENTS, NOTIFICATION_TYPES } from '@shared/constants';
import { ANIMALS, GAME_RULES } from '@shared/constants/farm';

import { ANIMALS_WAGES, TURN_START_INDEX } from './constants';
import { getAddedAnimalsCount, shuffleArray } from './helpers';

import type {
  DiceAnimals,
  TradableAnimals,
  Player,
  Room,
} from '@shared/types/farm';
import type { Server } from 'socket.io';

export function addRoomFields(): Pick<Room, 'rules' | 'order' | 'turn'> {
  return {
    rules: Object.values(GAME_RULES).reduce(
      (acc, rule) => {
        acc[rule] = false;
        return acc;
      },
      {} as Record<GAME_RULES, boolean>
    ),
    order: [],
    turn: TURN_START_INDEX,
  };
}

export function winnerHandler(io: Server, room: Room, player: Player): void {
  room.state = ROOM_STATES.FINISHED;
  room.winner = player.id;
  io.to(room.id).emit(EVENTS.NOTIFICATION, {
    type: NOTIFICATION_TYPES.GAME_FINISHED,
    data: player.name,
  });
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
  room.order = shuffleArray(room.players.map(p => p.id));
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
      have + getAddedAnimalsCount(room.players, room.rules, animal, add);
  });
}
