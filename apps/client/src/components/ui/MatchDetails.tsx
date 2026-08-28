import type { ReactElement } from 'react';

import { LanguageCode } from '@game/client-core/constants';
import { useLanguage } from '@game/client-core/hooks';

import type { MatchRecord } from '../../types/index.js';

import styles from './MatchDetails.module.css';

type MatchDetailsProps = {
  match: MatchRecord;
};

export function MatchDetails({ match }: MatchDetailsProps): ReactElement {
  const { language, translation } = useLanguage();
  const statisticsT = translation.statistics;
  const locale = language === LanguageCode.UA ? 'uk-UA' : 'en-US';
  const playedAt = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(match.timestamp);

  return (
    <div className={styles.details}>
      <strong className={match.winner ? styles.win : styles.loss}>
        {match.winner ? statisticsT.win : statisticsT.loss}
      </strong>
      <span>{playedAt}</span>
      <span>{statisticsT.players(match.players)}</span>
      {match.durationMs !== undefined ? (
        <span>{statisticsT.duration(match.durationMs)}</span>
      ) : null}
    </div>
  );
}
