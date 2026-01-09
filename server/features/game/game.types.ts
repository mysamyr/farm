import type { ANIMALS, ROOM_STATES } from '../../constants';

export type StartGameReq = { roomId: string };

export type RollDiceReq = { roomId: string };

export type Animals = (typeof ANIMALS)[keyof typeof ANIMALS];

export type TradableAnimals =
  | ANIMALS.DUCK
  | ANIMALS.GOAT
  | ANIMALS.PIG
  | ANIMALS.HORSE
  | ANIMALS.COW
  | ANIMALS.SMALL_DOG
  | ANIMALS.BIG_DOG;

export type DiceAnimals = Exclude<Animals, ANIMALS.SMALL_DOG | ANIMALS.BIG_DOG>;

export type FarmAnimals = Exclude<
  Animals,
  ANIMALS.SMALL_DOG | ANIMALS.BIG_DOG | ANIMALS.FOX | ANIMALS.BEAR
>;

export type ExchangeReq = {
  roomId: string;
  from: TradableAnimals;
  to: TradableAnimals;
};

export type RoomState = (typeof ROOM_STATES)[keyof typeof ROOM_STATES];
