import { ANIMALS, ANIMALS_ICONS_CONFIG, GAME_RULES } from '../../constants';
import { state } from '../../state/store';

import type { DiceAnimals, Player, Room, TradableAnimals } from '../../types';

export function isWildAnimal(animal: DiceAnimals): boolean {
  return [ANIMALS.FOX, ANIMALS.BEAR].includes(animal);
}

export function isLimitedCardsRule(room: Room): boolean {
  return !room.rules[GAME_RULES.UNLIMITED_CARDS];
}

export function getSortedPlayersByTurn(room: Room): Player[] {
  return room.order!.map(playerId => {
    return room.players.find(p => p.id === playerId)!;
  });
}

export function getUsedAnimalCards(
  room: Room,
  animal: TradableAnimals
): number {
  return room.players.reduce((acc, player) => {
    return acc + (player.animals[animal] || 0);
  }, 0);
}

export function getCurrentPlayerTurnId(room: Room): string | undefined {
  return room.order?.[room.turn ?? 0];
}

export function getDiceIcon(dice?: DiceAnimals): string {
  if (!dice) return '?';
  return ANIMALS_ICONS_CONFIG[dice].icon;
}

export function getActivePlayerId(): string {
  return state.currentRoom!.order![state.currentRoom!.turn!]!;
}

export function canExchange(
  animals: Record<TradableAnimals, number>,
  fromAnimal: TradableAnimals,
  count: number
): boolean {
  return (animals[fromAnimal] || 0) >= count;
}
