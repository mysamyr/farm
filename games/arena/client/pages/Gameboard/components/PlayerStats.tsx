import type { ReactElement } from 'react';

import { classNames } from '@game/client-core/utils';

import type { Player, StatType, StatusEffect } from '@game/game-arena/shared';

import { useArenaTranslation } from '../../../hooks/useArenaTranslation.js';
import { getPlayerStats } from '../../../utils/index.js';

import styles from './PlayerStats.module.css';

type PlayerStatsProps = {
  player: Player;
  isActive: boolean;
  isWinner?: boolean;
  isLoser?: boolean;
  isMatchEnded?: boolean;
  showStatuses?: boolean;
};

const STAT_TYPES: string[] = ['hp', 'armor', 'attack', 'crit', 'dodge'];

function getStatusLabel(
  status: StatusEffect,
  statusLabels: Record<string, string>
): string {
  const label = statusLabels[status.type] ?? status.type;
  if (status.permanent) return label;
  return `${label} (${status.remainingDuration})`;
}

// TODO: display player skills and cd

export default function PlayerStatsDisplay({
  player,
  isActive,
  isWinner = false,
  isLoser = false,
  isMatchEnded = false,
  showStatuses = false,
}: PlayerStatsProps): ReactElement {
  const t = useArenaTranslation();
  const stats = getPlayerStats(player);
  const visibleStatuses = player.statuses.filter(
    s => !(s.permanent && STAT_TYPES.includes(s.type))
  );

  const statusLabels: Record<string, string> = {
    poison: '☠️ Poison',
    bleed: '🩸 Bleed',
    stun: '💫 Stun',
    regeneration: '💚 Regen',
    resistance: '🔰 Resist',
    thorns: '🌿 Thorns',
  };

  return (
    <div
      className={classNames(
        styles.card,
        isActive && styles.active,
        isLoser && styles.loser,
        isWinner && styles.winner
      )}
    >
      <div className={styles.header}>
        <span className={styles.playerName}>{player.name}</span>
        {isActive && !isWinner && !isMatchEnded && (
          <span className={styles.turnBadge}>{t.fight.turnBadge}</span>
        )}
        {isWinner && (
          <span className={styles.winnerBadge}>{t.fight.winnerBadge}</span>
        )}
      </div>
      <div className={styles.statsGrid}>
        {(Object.keys(t.statLabels) as StatType[]).map(stat => (
          <div key={stat} className={styles.statItem}>
            <span className={styles.statLabel}>{t.statLabels[stat]}</span>
            <span className={styles.statValue}>{stats[stat]}</span>
          </div>
        ))}
      </div>
      {showStatuses && visibleStatuses.length > 0 && (
        <div className={styles.statusList}>
          {visibleStatuses.map((status, i) => (
            <span key={`${status.type}-${i}`} className={styles.statusBadge}>
              {getStatusLabel(status, statusLabels)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
