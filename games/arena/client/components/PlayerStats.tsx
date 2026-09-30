import {
  memo,
  useEffect,
  useState,
  type CSSProperties,
  type ReactElement,
} from 'react';

import { classNames } from '@game/client-core/utils';

import {
  getPlayerMaxHp,
  type Player,
  SKILLS,
  StatId,
  type StatusEffect,
  EffectId,
  SkillType,
} from '@game/game-arena/shared';

import { formatEffectValue, getEffectIcon } from '../constants/index.js';
import { useArenaTranslation } from '../hooks/useArenaTranslation.js';
import { getPlayerStats, type PlayerFxKeys } from '../utils/index.js';

import EffectTooltip from './EffectTooltip.js';
import HealthBar from './HealthBar.js';
import styles from './PlayerStats.module.css';
import SkillCard from './SkillCard.js';

const GRID_STATS: StatId[] = [
  StatId.attack,
  StatId.armor,
  StatId.crit,
  StatId.dodge,
];

const STRIKE_ANIMATION_MS = 450;

/** Fixed spread of the floating heal crosses: horizontal %, scale, start delay. */
const HEAL_CROSSES = [
  { x: 18, scale: 0.8, delay: 0 },
  { x: 38, scale: 1.15, delay: 140 },
  { x: 55, scale: 0.65, delay: 70 },
  { x: 72, scale: 1, delay: 240 },
  { x: 88, scale: 0.85, delay: 350 },
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
  fx?: PlayerFxKeys;
  isWinner?: boolean;
  isMatchEnded?: boolean;
  isSelf?: boolean;
  isTarget?: boolean;
  isEliminated?: boolean;
  showSkills?: boolean;
  onSelect?: (playerId: string) => void;
};

function PlayerStatsDisplay({
  player,
  turnOrder,
  isActive,
  fx,
  isWinner = false,
  isMatchEnded = false,
  isSelf = false,
  isTarget = false,
  isEliminated = false,
  showSkills = false,
  onSelect,
}: PlayerStatsProps): ReactElement {
  const t = useArenaTranslation();
  const stats = getPlayerStats(player);
  const visibleStatuses = player.statuses.filter(
    s => !StatId[s.type as StatId]
  );
  const selectable = Boolean(onSelect) && !isEliminated;

  const strikeKey = fx?.strike;
  const [isShaking, setIsShaking] = useState(false);

  // Re-trigger the shake on every new strike instead of relying on a class
  // toggle, which would not restart the animation for consecutive hits.
  useEffect(() => {
    if (!strikeKey) return;

    setIsShaking(true);
    const timer = setTimeout(() => setIsShaking(false), STRIKE_ANIMATION_MS);

    return () => {
      clearTimeout(timer);
      setIsShaking(false);
    };
  }, [strikeKey]);

  const getStatusLabel = (status: StatusEffect): string => {
    const effectId = status.type as EffectId;
    const effect = t.effects[effectId];
    const valueLabel = effect?.value
      ? formatEffectValue(effect.value.badge, status.value)
      : undefined;
    const label = `${getEffectIcon(effectId)} ${
      effect?.name ?? status.type
    }${valueLabel ? ` ${valueLabel}` : ''}`;
    return status.remainingDuration === undefined
      ? label
      : `${label} (${status.remainingDuration})`;
  };

  const handleSelect = () => onSelect?.(player.id);

  return (
    <div
      className={classNames(
        styles.card,
        isActive && styles.active,
        isWinner && styles.winner,
        isSelf && styles.self,
        isTarget && styles.target,
        isEliminated && styles.eliminated,
        selectable && styles.selectable,
        isShaking && styles.shake
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
      {fx?.crit && (
        <span
          key={`${fx.crit}-flash`}
          className={styles.critFlash}
          aria-hidden
        />
      )}
      {fx?.crit && (
        <span key={`${fx.crit}-text`} className={styles.critText} aria-hidden>
          CRIT
        </span>
      )}
      {fx?.heal && (
        <span key={`${fx.heal}-heal`} className={styles.healBurst} aria-hidden>
          {HEAL_CROSSES.map((cross, index) => (
            <span
              key={index}
              className={styles.healCross}
              style={
                {
                  '--heal-x': `${cross.x}%`,
                  '--heal-scale': String(cross.scale),
                  '--heal-delay': `${cross.delay}ms`,
                } as CSSProperties
              }
            >
              ✚
            </span>
          ))}
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
      {visibleStatuses.length > 0 && (
        <div className={styles.statusList}>
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
                value={status.value}
              />
            );
          })}
        </div>
      )}
      {(showSkills || isEliminated || isMatchEnded) && player.loadout.length > 0 && (
        <div className={styles.skillsGrid}>
          {player.loadout.map(skillId => {
            const skill = SKILLS[skillId];
            if (!skill) return null;

            const cooldown =
              skill.type === SkillType.passive
                ? undefined
                : player.skills.find(playerSkill => playerSkill.id === skill.id)
                    ?.cooldown;

            return (
              <SkillCard
                key={skill.id}
                skill={skill}
                cooldown={cooldown}
                showCooldown={skill.type !== SkillType.passive}
                disabled
                onClick={() => undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default memo(PlayerStatsDisplay);
