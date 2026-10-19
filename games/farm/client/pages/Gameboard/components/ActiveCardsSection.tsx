import { memo, type ReactElement, useMemo } from 'react';

import {
  ANIMALS,
  ANIMALS_DEFAULT_QUANTITY,
  type Room as FarmRoom,
  type TradableAnimals,
} from '@game/game-farm/shared';

import { ANIMALS_ICONS_CONFIG } from '../../../constants/index.js';

import styles from './ActiveCardsSection.module.css';

type ActiveCardsSectionProps = {
  room: FarmRoom;
};

function ActiveCardsSection({
  room,
}: ActiveCardsSectionProps): ReactElement {

  const usedCardsByAnimal = useMemo(() => {
    const counts: Partial<Record<TradableAnimals, number>> = {};

    for (const player of room.players) {
      for (const [animal, count] of Object.entries(player.animals)) {
        const key = animal as TradableAnimals;
        counts[key] = (counts[key] || 0) + count;
      }
    }

    return counts;
  }, [room.players]);

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

export default memo(ActiveCardsSection);
