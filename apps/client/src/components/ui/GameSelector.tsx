import { type ReactElement } from 'react';

import { useActiveGame, useGames } from '@game/client-core/hooks';

import styles from './GameSelector.module.css';

export function GameSelector(): ReactElement {
  const { activeGame, setActiveGame } = useActiveGame();
  const { games } = useGames();

  return (
    <div className={styles.container}>
      {games.map(game => {
        const isActive = game.id === activeGame;

        return (
          <button
            key={game.id}
            className={`${styles.tab} ${isActive ? styles.active : ''}`}
            onClick={() => setActiveGame(game.id)}
            aria-pressed={isActive}
            type="button"
          >
            <span className={styles.emoji}>{game.emoji}</span>
            <span className={styles.name}>{game.name}</span>
          </button>
        );
      })}
    </div>
  );
}
