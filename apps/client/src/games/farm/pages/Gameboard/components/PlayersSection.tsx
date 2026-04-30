import { type ReactElement, useState } from 'react';

import { ANIMALS } from '@game/shared/constants/farm';
import type {
  Room as FarmRoom,
  Player,
  TradableAnimals,
} from '@game/shared/types/farm';

import { useRoom } from '../../../../../hooks/useRoom';
import { classNames } from '../../../../../utils';
import { ANIMALS_ICONS_CONFIG } from '../../../constants';

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
  const room = currentRoom as FarmRoom;
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const players = room.order
    .map(playerId => room.players.find(player => player.id === playerId))
    .filter(Boolean) as Player[];

  return (
    <div className={styles.playersContainer}>
      {players.map(player => {
        const isActive = player.id === currentPlayerId;
        const isWinner = player.id === winnerId;
        const isCollapsed = !!collapsed[player.id];

        return (
          <div
            key={player.id}
            className={classNames(
              styles.playerCard,
              isActive && styles.activeTurn,
              isWinner && styles.winner
            )}
          >
            <div className={styles.playerHeader}>
              <span className={styles.playerName}>{player.name}</span>
              <div className={styles.playerActions}>
                <button
                  type="button"
                  className={styles.collapseBtn}
                  onClick={() =>
                    setCollapsed(prev => ({
                      ...prev,
                      [player.id]: !prev[player.id],
                    }))
                  }
                >
                  {isCollapsed ? '▼' : '▲'}
                </button>
              </div>
            </div>

            {!isCollapsed && (
              <div className={styles.animalGrid}>
                {Object.entries(ANIMALS_ICONS_CONFIG)
                  .filter(
                    ([animal]) =>
                      ![ANIMALS.FOX, ANIMALS.BEAR].includes(animal as ANIMALS)
                  )
                  .map(([animal, data]) => {
                    const count =
                      player.animals[animal as TradableAnimals] || 0;
                    return (
                      <div key={animal} className={styles.animalItem}>
                        <div className={styles.animalIcon}>{data.icon}</div>
                        <div className={styles.animalCount}>{count}</div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
