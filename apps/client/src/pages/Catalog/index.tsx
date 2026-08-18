import { type ReactElement } from 'react';

import { SiteRulesModal } from '@game/client-core/components';
import { useGames, useLanguage, useRoom } from '@game/client-core/hooks';

import { Header } from '../../components/index.js';

import styles from './Catalog.module.css';
import GameCard from './components/GameCard.js';

export default function CatalogPage(): ReactElement {
  const { games } = useGames();
  const { rooms } = useRoom();
  const { translation } = useLanguage();

  return (
    <div className={styles.container}>
      <Header helpModal={SiteRulesModal} />

      <h1 className={styles.title}>{translation.catalog.title}</h1>

      {games.length === 0 ? (
        <p className={styles.empty}>{translation.catalog.empty}</p>
      ) : (
        <div className={styles.grid}>
          {games.map(game => {
            const roomsCount = rooms.filter(
              room => room.game === game.id
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
