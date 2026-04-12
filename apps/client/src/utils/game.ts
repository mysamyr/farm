import { ANIMALS, GAME_RULES } from '@game/shared/constants/farm';

import type {
  DiceAnimals,
  Room,
  Rules,
  TradableAnimals,
} from '@game/shared/types/farm';

import { ANIMALS_ICONS_CONFIG } from '../constants';

import type { Translation } from '../types/language';

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
  switch (key) {
    case GAME_RULES.EXTRA_DUCK:
      return t.dashboard.rules[GAME_RULES.EXTRA_DUCK];
    case GAME_RULES.ONE_EXCHANGE:
      return t.dashboard.rules[GAME_RULES.ONE_EXCHANGE];
    case GAME_RULES.UNLIMITED_CARDS:
      return t.dashboard.rules[GAME_RULES.UNLIMITED_CARDS];
    default:
      return key;
  }
}

export function getOwnerName(room: Room): string {
  const owner = room.players.find(player => player.id === room.ownerId);
  return owner ? owner.name : 'Unknown';
}
