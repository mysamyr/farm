import {
  ANIMALS_WAGES,
  BLUE_DICE,
  FARM_ANIMALS,
  ORANGE_DICE,
} from '../../constants';

import type { DiceAnimals, TradableAnimals } from './game.types';
import type { Player } from '../player/player.types';
import type { Room, Rules } from '../room/room.types';

export function rollDice(): [DiceAnimals, DiceAnimals] {
  return [
    BLUE_DICE[Math.floor(Math.random() * BLUE_DICE.length)]!,
    ORANGE_DICE[Math.floor(Math.random() * ORANGE_DICE.length)]!,
  ];
}

export function checkWinner(player: Player): boolean {
  return FARM_ANIMALS.every(a => (player.animals[a] || 0) > 0);
}

export function canExchange(
  player: Player,
  from: TradableAnimals,
  to: TradableAnimals,
  count: number
): boolean {
  if (from === to) {
    return false;
  }
  const toWage = ANIMALS_WAGES[to]! * count;
  const fromWage = ANIMALS_WAGES[from]!;
  return fromWage * player.animals[from]! >= toWage;
}

export function isExchangeForbidden(room: Room, player: Player): boolean {
  return room.rules.one_exchange_per_turn && player.exchangedThisTurn;
}

export function getCurrentPlayerTurnId(room: Room): string {
  return room.order[room.turn] as string;
}

export function shuffleArray<T>(array: T[]): T[] {
  return array.toSorted(() => Math.random() - 0.5);
}

export function getInitDuckValue(rules: Rules): number {
  return rules.extra_duck ? 1 : 0;
}
