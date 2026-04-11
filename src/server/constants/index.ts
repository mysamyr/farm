import { ANIMALS } from '@shared/constants';

import type { DiceAnimals, FarmAnimals, TradableAnimals } from '@shared/types';

export const TURN_START_INDEX = 0 as const;

export const FARM_ANIMALS: FarmAnimals[] = [
  ANIMALS.DUCK,
  ANIMALS.GOAT,
  ANIMALS.PIG,
  ANIMALS.HORSE,
  ANIMALS.COW,
] as const;

export const BLUE_DICE: DiceAnimals[] = [
  ANIMALS.BEAR,
  ANIMALS.DUCK,
  ANIMALS.DUCK,
  ANIMALS.DUCK,
  ANIMALS.DUCK,
  ANIMALS.DUCK,
  ANIMALS.GOAT,
  ANIMALS.GOAT,
  ANIMALS.GOAT,
  ANIMALS.PIG,
  ANIMALS.PIG,
  ANIMALS.HORSE,
] as const;

export const ORANGE_DICE: DiceAnimals[] = [
  ANIMALS.FOX,
  ANIMALS.DUCK,
  ANIMALS.DUCK,
  ANIMALS.DUCK,
  ANIMALS.DUCK,
  ANIMALS.DUCK,
  ANIMALS.GOAT,
  ANIMALS.GOAT,
  ANIMALS.GOAT,
  ANIMALS.PIG,
  ANIMALS.PIG,
  ANIMALS.COW,
] as const;

export const ANIMALS_WAGES: Record<TradableAnimals, number> = {
  [ANIMALS.DUCK]: 1,
  [ANIMALS.GOAT]: 6,
  [ANIMALS.PIG]: 12,
  [ANIMALS.HORSE]: 36,
  [ANIMALS.COW]: 72,
  [ANIMALS.SMALL_DOG]: 6,
  [ANIMALS.BIG_DOG]: 36,
} as const;
