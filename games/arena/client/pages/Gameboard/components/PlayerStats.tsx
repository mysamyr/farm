import type { ReactElement } from 'react';

import { classNames } from '@game/client-core/utils';

import {
  getPlayerMaxHp,
  Player,
  StatId,
  StatusEffect,
  EffectId,
} from '@game/game-arena/shared';

import { useArenaTranslation } from '../../../hooks/useArenaTranslation.js';
import { getPlayerStats } from '../../../utils/index.js';

import HealthBar from './HealthBar.js';
import styles from './PlayerStats.module.css';

const GRID_STATS: StatId[] = [
  StatId.attack,
  StatId.crit,
  StatId.armor,
  StatId.dodge,
];

type PlayerStatsProps = {
  player: Player;
  isActive: boolean;
  isWinner?: boolean;
  isLoser?: boolean;
  isMatchEnded?: boolean;
  showStatuses?: boolean;
};

function getStatusLabel(
  status: StatusEffect,
  statusLabels: Record<string, string>
): string {
  const label = statusLabels[status.type] ?? status.type;
  if (status.remainingDuration === undefined) return label;
  return `${label} (${status.remainingDuration})`;
}

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
    s => !StatId[s.type as StatId]
  );

  const statusLabels: Record<EffectId, string> = {
    poison: '☠️ Poison',
    bleed: '🩸 Bleed',
    stun: '💫 Stun',
    regeneration: '💚 Regen',
    resistance: '🔰 Resist',
    thorns: '🌵 Thorns',
    leech: '🧛 Leech',
    pierce: '🗡️ Pierce',
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
      <HealthBar
        current={stats.hp}
        max={getPlayerMaxHp(player)}
        label={t.statLabels.hp}
      />
      <div className={styles.statsGrid}>
        {GRID_STATS.map(stat => (
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
