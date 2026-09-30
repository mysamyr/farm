import { memo, type CSSProperties, type ReactElement } from 'react';

import { type Player } from '../../../../shared/index.js';

import PlayerStatsDisplay from '../../../components/PlayerStats.js';
import { useArenaTranslation } from '../../../hooks/useArenaTranslation.js';
import { isPlayerEliminated } from '../../../utils/index.js';

import styles from './OpponentsZone.module.css';

type OpponentsZoneProps = {
  opponents: Player[];
  turnOrder: string[];
  activePlayerId?: string;
  selectedTargetId?: string;
  winnerId?: string;
  isMatchEnded: boolean;
  getCritHitEventKey: (playerId: string) => string | undefined;
  onSelectTarget: (playerId: string) => void;
};

function OpponentsZone({
  opponents,
  turnOrder,
  activePlayerId,
  selectedTargetId,
  winnerId,
  isMatchEnded,
  getCritHitEventKey,
  onSelectTarget,
}: OpponentsZoneProps): ReactElement {
  const t = useArenaTranslation();

  return (
    <section className={styles.zone}>
      <span className={styles.label}>{t.fight.opponentsLabel}</span>
      <div
        className={styles.grid}
        data-count={Math.min(opponents.length, 3)}
        style={
          {
            '--opponent-columns': String(Math.min(opponents.length, 3)),
          } as CSSProperties
        }
      >
        {opponents.map(opponent => {
          const eliminated = isPlayerEliminated(opponent);
          const isTarget = opponent.id === selectedTargetId;

          return (
            <PlayerStatsDisplay
              key={opponent.id}
              player={opponent}
              turnOrder={turnOrder.indexOf(opponent.id) + 1}
              isActive={activePlayerId === opponent.id}
              isTarget={isTarget}
              isEliminated={eliminated}
              critHitEventKey={getCritHitEventKey(opponent.id)}
              isWinner={winnerId === opponent.id}
              isMatchEnded={isMatchEnded}
              onSelect={onSelectTarget}
            />
          );
        })}
      </div>
    </section>
  );
}

export default memo(OpponentsZone);
