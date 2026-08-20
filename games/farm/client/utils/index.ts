import {
  ANIMALS,
  type DiceAnimals,
  type Room,
  type TradableAnimals,
} from '@game/game-farm/shared';

import { ANIMALS_ICONS_CONFIG } from '../constants/index.js';

export function getCurrentPlayerTurnId(room: Room): string | undefined {
  return room.order[room.turn ?? 0];
}

export function isWildAnimal(animal?: DiceAnimals): boolean {
  if (!animal) {
    return false;
  }
  return [ANIMALS.FOX, ANIMALS.BEAR].includes(animal);
}

export function getDiceIcon(dice?: DiceAnimals): string {
  if (!dice) {
    return '🎲';
  }
  return ANIMALS_ICONS_CONFIG[dice].icon;
}

export function canExchange(
  animals: Record<TradableAnimals, number>,
  fromAnimal: TradableAnimals,
  count: number
): boolean {
  return (animals[fromAnimal] || 0) >= count;
}
