import type { RoomNameConfig } from './index.js';

type Gender = 'm' | 'f' | 'n';

type Noun = {
  word: string;
  gender: Gender;
};

type Adjective = Record<Gender, string>;

const NOUNS: Noun[] = [
  { word: 'Луг', gender: 'm' },
  { word: 'Ліс', gender: 'm' },
  { word: 'Океан', gender: 'm' },
  { word: 'Острів', gender: 'm' },
  { word: 'Річка', gender: 'f' },
  { word: 'Гора', gender: 'f' },
  { word: 'Долина', gender: 'f' },
  { word: 'Пустеля', gender: 'f' },
  { word: 'Село', gender: 'n' },
  { word: 'Місто', gender: 'n' },
];

const ADJECTIVES: Adjective[] = [
  { m: 'Сонячний', f: 'Сонячна', n: 'Сонячне' },
  { m: 'Туманний', f: 'Туманна', n: 'Туманне' },
  { m: 'Тихий', f: 'Тиха', n: 'Тихе' },
  { m: 'Жвавий', f: 'Жвава', n: 'Жваве' },
  { m: 'Щасливий', f: 'Щаслива', n: 'Щасливе' },
  { m: 'Сумний', f: 'Сумна', n: 'Сумне' },
  { m: 'Хоробрий', f: 'Хоробра', n: 'Хоробре' },
  { m: "Сором'язливий", f: "Сором'язлива", n: "Сором'язливе" },
  { m: 'Розумний', f: 'Розумна', n: 'Розумне' },
  { m: 'Лінивий', f: 'Лінива', n: 'Ліниве' },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export const uaConfig: RoomNameConfig = {
  generate: () => {
    const noun = pickRandom(NOUNS);
    const adj = pickRandom(ADJECTIVES);
    return `${adj[noun.gender]} ${noun.word}`;
  },
  combinations: ADJECTIVES.length * NOUNS.length,
};
