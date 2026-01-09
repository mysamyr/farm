import {
  ANIMALS_DEFAULT_QUANTITY,
  ANIMALS_WAGES,
  BLUE_DICE,
  FARM_ANIMALS,
  GAME_RULES,
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

export function isEnoughCardsToExchange(
  player: Player,
  from: TradableAnimals,
  to: TradableAnimals
): boolean {
  if (from === to) {
    return false;
  }
  const toWage = ANIMALS_WAGES[to]!;
  const fromWage = ANIMALS_WAGES[from]!;
  return fromWage * player.animals[from]! >= toWage;
}

function getUsedAnimalsCount(
  players: Player[],
  animal: TradableAnimals
): number {
  return players.reduce(
    (acc: number, player: Player): number => acc + player.animals[animal]!,
    0
  );
}

export function getAddedAnimalsCount(
  players: Player[],
  rules: Rules,
  animal: TradableAnimals,
  expectedAddCount: number
): number {
  if (rules[GAME_RULES.UNLIMITED_CARDS]) {
    return expectedAddCount;
  }
  const maxAnimals = ANIMALS_DEFAULT_QUANTITY[animal]!;
  const usedAnimals = getUsedAnimalsCount(players, animal);
  const availableToAdd = Math.max(0, maxAnimals - usedAnimals);
  return Math.min(expectedAddCount, availableToAdd);
}

export function areLimitedCards(room: Room, to: TradableAnimals): boolean {
  const maxAnimals = ANIMALS_DEFAULT_QUANTITY[to];
  return (
    !room.rules[GAME_RULES.UNLIMITED_CARDS] &&
    getUsedAnimalsCount(Array.from(room.players.values()), to) >= maxAnimals
  );
}

export function isExchangeForbidden(room: Room, player: Player): boolean {
  return room.rules[GAME_RULES.ONE_EXCHANGE] && player.exchangedThisTurn;
}

export function getCurrentPlayerTurnId(room: Room): string {
  return room.order[room.turn] as string;
}

export function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

export function getInitDuckValue(rules: Rules): number {
  return rules[GAME_RULES.EXTRA_DUCK] ? 1 : 0;
}
