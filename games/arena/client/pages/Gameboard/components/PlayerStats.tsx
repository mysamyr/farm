import type { ReactElement } from 'react';

import { classNames } from '@game/client-core/utils';

import {
  getPlayerMaxHp,
  Player,
  StatId,
  StatusEffect,
  EffectId,
} from '@game/game-arena/shared';

import { getEffectIcon } from '../../../constants/index.js';
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
  critHitEventKey?: string;
  isWinner?: boolean;
  isLoser?: boolean;
  isMatchEnded?: boolean;
  showStatuses?: boolean;
  isSelf?: boolean;
  isTarget?: boolean;
  isEliminated?: boolean;
  onSelect?: () => void;
};

function getStatIcon(label: string): string {
  return label.split(' ')[0] ?? label;
}

function getStatText(label: string): string {
  const parts = label.split(' ');
  return parts.length > 1 ? parts.slice(1).join(' ') : label;
}

function getStatusLabel(
  status: StatusEffect,
  effectLabels: Record<EffectId, string>
): string {
  const effectId = status.type as EffectId;
  const label = `${getEffectIcon(effectId)} ${effectLabels[effectId] ?? status.type}`;
  if (status.remainingDuration === undefined) return label;
  return `${label} (${status.remainingDuration})`;
}

export default function PlayerStatsDisplay({
  player,
  isActive,
  critHitEventKey,
  isWinner = false,
  isLoser = false,
  isMatchEnded = false,
  showStatuses = false,
  isSelf = false,
  isTarget = false,
  isEliminated = false,
  onSelect,
}: PlayerStatsProps): ReactElement {
  const t = useArenaTranslation();
  const stats = getPlayerStats(player);
  const visibleStatuses = player.statuses.filter(
    s => !StatId[s.type as StatId]
  );
  const selectable = Boolean(onSelect) && !isEliminated;

  return (
    <div
      className={classNames(
        styles.card,
        isActive && styles.active,
        isLoser && styles.loser,
        isWinner && styles.winner,
        isSelf && styles.self,
        isTarget && styles.target,
        isEliminated && styles.eliminated,
        selectable && styles.selectable
      )}
      onClick={selectable ? onSelect : undefined}
      role={selectable ? 'button' : undefined}
      tabIndex={selectable ? 0 : undefined}
      onKeyDown={
        selectable
          ? event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect?.();
              }
            }
          : undefined
      }
    >
      {critHitEventKey && (
        <span
          key={`${critHitEventKey}-flash`}
          className={styles.critFlash}
          aria-hidden
        />
      )}
      {critHitEventKey && (
        <span
          key={`${critHitEventKey}-text`}
          className={styles.critText}
          aria-hidden
        >
          CRIT
        </span>
      )}
      <div className={styles.header}>
        <span className={styles.playerName}>{player.name}</span>
        {isTarget && !isEliminated && !isMatchEnded && (
          <span className={styles.targetBadge}>{t.fight.targetBadge}</span>
        )}
        {isEliminated && (
          <span className={styles.eliminatedBadge}>
            {t.fight.eliminatedBadge}
          </span>
        )}
        {isActive && !isWinner && !isMatchEnded && !isEliminated && (
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
          <div
            key={stat}
            className={styles.statItem}
            title={getStatText(t.statLabels[stat])}
          >
            <span className={styles.statIcon} aria-hidden>
              {getStatIcon(t.statLabels[stat])}
            </span>
            <span className={styles.statValue}>{stats[stat]}</span>
          </div>
        ))}
      </div>
      {showStatuses && visibleStatuses.length > 0 && (
        <div className={styles.statusList}>
          {visibleStatuses.map((status, i) => (
            <span key={`${status.type}-${i}`} className={styles.statusBadge}>
              {getStatusLabel(status, t.effectLabels)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
