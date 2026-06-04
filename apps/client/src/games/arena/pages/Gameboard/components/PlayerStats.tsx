import type { ReactElement } from 'react';

import type { Player, StatType, StatusEffect } from '@game/shared/types/arena';

import { classNames } from '../../../../../utils';
import { STAT_LABELS } from '../../../constants';
import { getPlayerStats } from '../../../utils';

import styles from './PlayerStats.module.css';

type PlayerStatsProps = {
  player: Player;
  isActive: boolean;
  isWinner?: boolean;
  showStatuses?: boolean;
};

const STATUS_LABELS: Record<string, string> = {
  poison: '☠️ Poison',
  bleed: '🩸 Bleed',
  stun: '💫 Stun',
  regeneration: '💚 Regen',
  resistance: '🔰 Resist',
  thorns: '🌿 Thorns',
};

const STAT_TYPES: string[] = ['hp', 'armor', 'attack', 'crit', 'dodge'];

function getStatusLabel(status: StatusEffect): string {
  const label = STATUS_LABELS[status.type] ?? status.type;
  if (status.permanent) return label;
  return `${label} (${status.remainingDuration})`;
}

export default function PlayerStatsDisplay({
  player,
  isActive,
  isWinner = false,
  showStatuses = false,
}: PlayerStatsProps): ReactElement {
  const stats = getPlayerStats(player);
  const visibleStatuses = player.statuses.filter(
    s => !(s.permanent && STAT_TYPES.includes(s.type))
  );

  return (
    <div
      className={classNames(
        styles.card,
        isActive && styles.active,
        isWinner && styles.winner
      )}
    >
      <div className={styles.header}>
        <span className={styles.playerName}>{player.name}</span>
        {isActive && !isWinner && (
          <span className={styles.turnBadge}>Turn</span>
        )}
        {isWinner && <span className={styles.winnerBadge}>Winner 🏆</span>}
      </div>
      <div className={styles.statsGrid}>
        {(Object.keys(STAT_LABELS) as StatType[]).map(stat => (
          <div key={stat} className={styles.statItem}>
            <span className={styles.statLabel}>{STAT_LABELS[stat]}</span>
            <span className={styles.statValue}>{stats[stat]}</span>
          </div>
        ))}
      </div>
      {showStatuses && visibleStatuses.length > 0 && (
        <div className={styles.statusList}>
          {visibleStatuses.map((status, i) => (
            <span key={`${status.type}-${i}`} className={styles.statusBadge}>
              {getStatusLabel(status)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
