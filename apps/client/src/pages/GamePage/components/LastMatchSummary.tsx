import type { ReactElement } from 'react';

import { useLanguage } from '@game/client-core/hooks';
import type { GameId } from '@game/shared/constants';

import { MatchDetails } from '../../../components/ui/MatchDetails.js';
import { useGameStatistics } from '../../../hooks/index.js';

import styles from './LastMatchSummary.module.css';

type LastMatchSummaryProps = {
  gameId: GameId;
};

export default function LastMatchSummary({
  gameId,
}: LastMatchSummaryProps): ReactElement {
  const matches = useGameStatistics(gameId);
  const { translation } = useLanguage();
  const lastMatch = matches.at(-1);

  return (
    <details className={styles.container}>
      <summary className={styles.summary}>
        {translation.statistics.lastMatch}
      </summary>
      <div className={styles.content}>
        {lastMatch ? (
          <MatchDetails match={lastMatch} />
        ) : (
          <p>{translation.statistics.noMatches}</p>
        )}
      </div>
    </details>
  );
}
