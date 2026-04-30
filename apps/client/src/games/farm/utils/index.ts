import { ANIMALS } from '@game/shared/constants/farm';

import type {
  DiceAnimals,
  Room,
  Rules,
  TradableAnimals,
} from '@game/shared/types/farm';

import type { Translation } from '../../../types/language';

import { ANIMALS_ICONS_CONFIG } from '../constants';

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
    return '?';
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

export function getRuleLabel(key: keyof Rules, t: Translation): string {
  return t.dashboard.rules[key] ?? key;
}

export function getOwnerName(room: Room): string {
  const owner = room.players.find(player => player.id === room.ownerId);
  return owner ? owner.name : 'Unknown';
}
