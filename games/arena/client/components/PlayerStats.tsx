import { memo, useEffect, useRef, useState, type ReactElement } from 'react';

import { classNames } from '@game/client-core/utils';

import {
  getPlayerMaxHp,
  type Player,
  StatId,
  type StatusEffect,
  EffectId,
} from '@game/game-arena/shared';

import { getEffectIcon } from '../constants/index.js';
import { useArenaTranslation } from '../hooks/useArenaTranslation.js';
import { getPlayerStats } from '../utils/index.js';

import EffectTooltip from './EffectTooltip.js';
import HealthBar from './HealthBar.js';
import styles from './PlayerStats.module.css';

const GRID_STATS: StatId[] = [
  StatId.attack,
  StatId.armor,
  StatId.crit,
  StatId.dodge,
];

function getStatIcon(label: string): string {
  return label.split(' ')[0] ?? label;
}

function getStatText(label: string): string {
  const parts = label.split(' ');
  return parts.length > 1 ? parts.slice(1).join(' ') : label;
}

type PlayerStatsProps = {
  player: Player;
  turnOrder?: number;
  isActive: boolean;
  critHitEventKey?: string;
  isWinner?: boolean;
  isLoser?: boolean;
  isMatchEnded?: boolean;
  showStatuses?: boolean;
  isSelf?: boolean;
  isTarget?: boolean;
  isEliminated?: boolean;
  onSelect?: (playerId: string) => void;
};

function PlayerStatsDisplay({
  player,
  turnOrder,
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
  const [openStatusKey, setOpenStatusKey] = useState<string | null>(null);
  const statusListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (openStatusKey === null) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (target && statusListRef.current?.contains(target)) return;
      setOpenStatusKey(null);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenStatusKey(null);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openStatusKey]);

  const getStatusLabel = (status: StatusEffect): string => {
    const effectId = status.type as EffectId;
    const label = `${getEffectIcon(effectId)} ${
      t.effectLabels[effectId] ?? status.type
    }`;
    return status.remainingDuration === undefined
      ? label
      : `${label} (${status.remainingDuration})`;
  };
  const stats = getPlayerStats(player);
  const visibleStatuses = player.statuses.filter(
    s => !StatId[s.type as StatId]
  );
  const selectable = Boolean(onSelect) && !isEliminated;
  const handleSelect = () => onSelect?.(player.id);

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
      onClick={selectable ? handleSelect : undefined}
      role={selectable ? 'button' : undefined}
      tabIndex={selectable ? 0 : undefined}
      onKeyDown={
        selectable
          ? event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleSelect();
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
        <span className={styles.playerName}>
          {turnOrder !== undefined ? `${turnOrder}. ` : ''}
          {player.name}
        </span>
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
        <div className={styles.statusList} ref={statusListRef}>
          {visibleStatuses.map((status, i) => {
            const key = `${status.type}-${i}`;
            const effectId = status.type as EffectId;
            const label = getStatusLabel(status);

            if (!EffectId[effectId]) {
              return (
                <span key={key} className={styles.statusBadge}>
                  {label}
                </span>
              );
            }

            return (
              <EffectTooltip
                key={key}
                effectId={effectId}
                label={label}
                open={openStatusKey === key}
                onOpenChange={next => setOpenStatusKey(next ? key : null)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default memo(PlayerStatsDisplay);
