import { type ReactElement } from 'react';

import { GAME_IDS } from '@game/shared/constants';

import { getGameConfig } from '../../games/registry';

import { useActiveGame } from '../../hooks/useActiveGame';
import { useLanguage } from '../../hooks/useLanguage';

import styles from './GameSelector.module.css';

export default function GameSelector(): ReactElement {
  const { translation } = useLanguage();
  const { activeGame, setActiveGame } = useActiveGame();

  return (
    <div className={styles.container}>
      {Object.values(GAME_IDS).map(gameId => {
        const isActive = gameId === activeGame;
        const gameInfo = getGameConfig(gameId);

        return (
          <button
            key={gameId}
            className={`${styles.tab} ${isActive ? styles.active : ''}`}
            onClick={() => setActiveGame(gameId)}
            aria-pressed={isActive}
            type="button"
          >
            <span className={styles.emoji}>{gameInfo.emoji}</span>
            <span className={styles.name}>{translation.game[gameId].name}</span>
          </button>
        );
      })}
    </div>
  );
}
