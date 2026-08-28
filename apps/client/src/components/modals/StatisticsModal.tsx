import { type ReactElement, useEffect, useState } from 'react';

import { Button, HelpModal } from '@game/client-core/components';
import { ButtonVariant } from '@game/client-core/constants';
import { useLanguage } from '@game/client-core/hooks';
import type { GameId } from '@game/shared/constants';

import { useGameStatistics, useGames } from '../../hooks/index.js';
import { clearAllStatistics } from '../../utils/index.js';

import { MatchDetails } from '../ui/MatchDetails.js';

import styles from './StatisticsModal.module.css';

export default function StatisticsModal(): ReactElement {
  const { games } = useGames();
  const { translation } = useLanguage();
  const statisticsT = translation.statistics;
  const [selectedGameId, setSelectedGameId] = useState<GameId | null>(
    games[0]?.id ?? null
  );
  const [confirmingReset, setConfirmingReset] = useState(false);
  const matches = useGameStatistics(selectedGameId);

  useEffect(() => {
    const firstGame = games[0];
    if (firstGame && !games.some(game => game.id === selectedGameId)) {
      setSelectedGameId(firstGame.id);
    }
  }, [games, selectedGameId]);

  return (
    <HelpModal>
      <div className={styles.container}>
        <h2 className={styles.title}>{statisticsT.title}</h2>

        <label className={styles.label} htmlFor="statistics-game">
          {statisticsT.selectGame}
        </label>
        <select
          id="statistics-game"
          className={styles.select}
          value={selectedGameId ?? ''}
          onChange={event => {
            setSelectedGameId(event.target.value as GameId);
          }}
        >
          {games.map(game => (
            <option key={game.id} value={game.id}>
              {game.emoji} {game.name}
            </option>
          ))}
        </select>

        <h3 className={styles.subtitle}>{statisticsT.recentMatches}</h3>
        {matches.length === 0 ? (
          <p className={styles.empty}>{statisticsT.noMatches}</p>
        ) : (
          <ol className={styles.matches}>
            {[...matches].reverse().map(match => (
              <li key={match.id} className={styles.match}>
                <MatchDetails match={match} />
              </li>
            ))}
          </ol>
        )}

        {confirmingReset ? (
          <section className={styles.confirmation} aria-live="polite">
            <h3>{statisticsT.resetConfirmTitle}</h3>
            <p>{statisticsT.resetConfirmMessage}</p>
            <div className={styles.actions}>
              <Button
                variant={ButtonVariant.SECONDARY}
                onClick={() => setConfirmingReset(false)}
              >
                {statisticsT.cancel}
              </Button>
              <Button
                variant={ButtonVariant.DANGER}
                onClick={() => {
                  clearAllStatistics();
                  setConfirmingReset(false);
                }}
              >
                {statisticsT.resetConfirm}
              </Button>
            </div>
          </section>
        ) : (
          <Button
            variant={ButtonVariant.DANGER}
            className={styles.reset}
            onClick={() => setConfirmingReset(true)}
          >
            {statisticsT.reset}
          </Button>
        )}
      </div>
    </HelpModal>
  );
}
