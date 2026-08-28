import type { RoomNameConfig } from './index.js';

const ADJECTIVES = [
  'Sunny',
  'Misty',
  'Quiet',
  'Lively',
  'Happy',
  'Sad',
  'Brave',
  'Shy',
  'Clever',
  'Lazy',
];

const NOUNS = [
  'Meadow',
  'Forest',
  'River',
  'Mountain',
  'Valley',
  'Ocean',
  'Desert',
  'Island',
  'Village',
  'City',
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export const enConfig: RoomNameConfig = {
  generate: () => `${pickRandom(ADJECTIVES)} ${pickRandom(NOUNS)}`,
  combinations: ADJECTIVES.length * NOUNS.length,
};
