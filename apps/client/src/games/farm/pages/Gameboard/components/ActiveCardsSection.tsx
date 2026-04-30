import type { ReactElement } from 'react';

import { ANIMALS, ANIMALS_DEFAULT_QUANTITY } from '@game/shared/constants/farm';
import type {
  Room as FarmRoom,
  TradableAnimals,
} from '@game/shared/types/farm';

import { useRoom } from '../../../../../hooks/useRoom';
import { ANIMALS_ICONS_CONFIG } from '../../../constants';

import styles from './ActiveCardsSection.module.css';

export default function ActiveCardsSection(): ReactElement {
  const { currentRoom } = useRoom();
  const room = currentRoom as FarmRoom;

  const usedCardsByAnimal: Partial<Record<TradableAnimals, number>> = {};

  for (const player of room.players) {
    for (const [animal, count] of Object.entries(player.animals)) {
      const key = animal as TradableAnimals;
      usedCardsByAnimal[key] = (usedCardsByAnimal[key] || 0) + count;
    }
  }

  return (
    <div className={styles.container}>
      {Object.entries(ANIMALS_ICONS_CONFIG)
        .filter(
          ([animal]) => ![ANIMALS.FOX, ANIMALS.BEAR].includes(animal as ANIMALS)
        )
        .map(([animal, data]) => {
          const key = animal as TradableAnimals;
          const cardsLeft =
            ANIMALS_DEFAULT_QUANTITY[key] - (usedCardsByAnimal[key] || 0);

          return (
            <div className={styles.animalItem} key={animal}>
              <div className={styles.animalIcon}>{data.icon}</div>
              <div className={styles.animalCount}>{cardsLeft}</div>
            </div>
          );
        })}
    </div>
  );
}
