import { LanguageCode } from '../../constants/index.js';

import { enConfig } from './en.js';
import { uaConfig } from './ua.js';

export type RoomNameConfig = {
  /** Returns a single randomly generated room name. */
  generate: () => string;
  /** Total number of unique name combinations (used to bound dedup attempts). */
  combinations: number;
};

const REGISTRY: Partial<Record<LanguageCode, RoomNameConfig>> = {
  [LanguageCode.EN]: enConfig,
  [LanguageCode.UA]: uaConfig,
};

/**
 * Generates a unique room name for the given language that is not already
 * present in `existingNames`. Falls back to English if the language has no
 * registered config. Appends a numeric suffix when all combinations are taken.
 */
export function generateRoomName(
  language: LanguageCode,
  existingNames: string[] = []
): string {
  const config = REGISTRY[language] ?? REGISTRY[LanguageCode.EN]!;
  const { generate, combinations } = config;

  let attempts = 0;
  while (attempts < combinations) {
    const name = generate();
    if (!existingNames.includes(name)) return name;
    attempts++;
  }

  // All standard combinations are taken — append a number to make it unique.
  let suffix = 2;
  const base = generate();
  while (existingNames.includes(`${base} ${suffix}`)) suffix++;
  return `${base} ${suffix}`;
}
