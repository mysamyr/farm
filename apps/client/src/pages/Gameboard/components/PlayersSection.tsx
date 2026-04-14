import type { ReactElement } from 'react';

import { ANIMALS } from '@game/shared/constants/farm';
import type { Player, TradableAnimals } from '@game/shared/types/farm';

import { ANIMALS_ICONS_CONFIG } from '../../../constants';
import { useRoom } from '../../../hooks/useRoom';
import { classNames } from '../../../utils';

import styles from './PlayersSection.module.css';

type PlayersSectionProps = {
  currentPlayerId?: string;
  winnerId?: string;
};

export default function PlayersSection({
  currentPlayerId,
  winnerId,
}: PlayersSectionProps): ReactElement {
  const { currentRoom } = useRoom();

  const players = currentRoom!.order
    .map(playerId =>
      currentRoom!.players.find(player => player.id === playerId)
    )
    .filter(Boolean) as Player[];

  // TODO: remove active player after winner event (currently active player is still shown as active)

  return (
    <div className={styles.playersContainer}>
      {players.map(player => {
        const isActive = player.id === currentPlayerId;
        const isWinner = player.id === winnerId;

        return (
          <div
            key={player.id}
            className={classNames(
              styles.playerCard,
              isActive && styles.activeTurn,
              isWinner && styles.winner
            )}
          >
            <div className={styles.playerHeader}>{player.name}</div>

            <div className={styles.animalGrid}>
              {Object.entries(ANIMALS_ICONS_CONFIG)
                .filter(
                  ([animal]) =>
                    ![ANIMALS.FOX, ANIMALS.BEAR].includes(animal as ANIMALS)
                )
                .map(([animal, data]) => {
                  const count = player.animals[animal as TradableAnimals] || 0;
                  return (
                    <div key={animal} className={styles.animalItem}>
                      <div className={styles.animalIcon}>{data.icon}</div>
                      <div className={styles.animalCount}>{count}</div>
                    </div>
                  );
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
