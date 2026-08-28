import { type ReactElement } from 'react';

import { useLanguage, useRoom } from '@game/client-core/hooks';
import { ROOM_STATES } from '@game/shared/constants';

import { useGames } from '../../hooks/index.js';

import styles from './Catalog.module.css';
import GameCard from './components/GameCard.js';

export default function CatalogPage(): ReactElement {
  const { games } = useGames();
  const { rooms } = useRoom();
  const { translation } = useLanguage();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{translation.catalog.title}</h1>

      {games.length === 0 ? (
        <p className={styles.empty}>{translation.catalog.empty}</p>
      ) : (
        <div className={styles.grid}>
          {games.map(game => {
            const roomsCount = rooms.filter(
              room => room.game === game.id && room.state === ROOM_STATES.IDLE
            ).length;

            return (
              <GameCard key={game.id} game={game} roomsCount={roomsCount} />
            );
          })}
        </div>
      )}
    </div>
  );
}
