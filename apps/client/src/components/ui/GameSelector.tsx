import { type ReactElement } from 'react';

import { GAME_IDS } from '@game/shared/constants';
import { type GameId } from '@game/shared/types';

import { getGameConfig } from '../../games/registry';

import { useLanguage } from '../../hooks/useLanguage';

import styles from './GameSelector.module.css';

type GameSelectorProps = {
  activeGame: GameId;
  onGameChange: (gameId: GameId) => void;
};

export default function GameSelector({
  activeGame,
  onGameChange,
}: GameSelectorProps): ReactElement {
  const { translation } = useLanguage();

  return (
    <div className={styles.container}>
      {Object.values(GAME_IDS).map(gameId => {
        const isActive = gameId === activeGame;
        const gameInfo = getGameConfig(gameId);

        return (
          <button
            key={gameId}
            className={`${styles.tab} ${isActive ? styles.active : ''}`}
            onClick={() => onGameChange(gameId)}
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
