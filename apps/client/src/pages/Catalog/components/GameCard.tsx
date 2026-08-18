import { type ReactElement } from 'react';

import { getGamePath } from '@game/client-core/constants';
import { useLanguage } from '@game/client-core/hooks';
import type { GameMetadata } from '@game/shared/types';
import { useNavigate } from 'react-router-dom';

import { useGameConfig } from '../../../hooks/index.js';

import styles from './GameCard.module.css';

type GameCardProps = {
  game: GameMetadata;
  roomsCount: number;
};

export default function GameCard({
  game,
  roomsCount,
}: GameCardProps): ReactElement {
  const navigate = useNavigate();
  const { language, translation } = useLanguage();
  const { config } = useGameConfig(game.id);

  const title = config ? config.title(language) : game.name;
  const description = config?.shortDescription(language) ?? '';
  const bannerUrl = config?.bannerUrl;

  return (
    <button
      type="button"
      className={styles.card}
      onClick={() => {
        void navigate(getGamePath(game.id));
      }}
    >
      <div className={styles.bannerWrap}>
        {bannerUrl ? (
          <img className={styles.banner} src={bannerUrl} alt="" />
        ) : (
          <div className={styles.bannerFallback}>
            <span>{game.emoji}</span>
          </div>
        )}
      </div>
      <div className={styles.body}>
        <h2 className={styles.title}>
          {game.emoji} {title}
        </h2>
        {description ? (
          <p className={styles.description}>{description}</p>
        ) : null}
        <div className={styles.meta}>
          <span>
            {translation.catalog.playersRange(game.minPlayers, game.maxPlayers)}
          </span>
          <span>{translation.catalog.roomsCount(roomsCount)}</span>
        </div>
      </div>
    </button>
  );
}
