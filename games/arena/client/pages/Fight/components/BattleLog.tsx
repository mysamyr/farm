import { memo, useMemo, useState, type ReactElement } from 'react';

import { classNames } from '@game/client-core/utils';

import {
  ActionTarget,
  LogEffectKind,
  type LogEffect,
  type LogStep,
} from '../../../../shared/index.js';

import { getSkillName, getStatLabel } from '../../../constants/index.js';
import { useArenaTranslation } from '../../../hooks/useArenaTranslation.js';

import styles from './BattleLog.module.css';

type BattleLogProps = {
  steps: LogStep[];
};

function BattleLog({ steps }: BattleLogProps): ReactElement {
  const t = useArenaTranslation();
  const { battleLog, effectLabels, statLabels, skillNames, util } = t;
  const [isOpen, setIsOpen] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(min-width: 1024px)').matches
  );

  const entries = useMemo(() => {
    const getTargetLabel = (
      target: ActionTarget,
      targetName?: string
    ): string =>
      target === ActionTarget.self ? util.self : (targetName ?? util.opponent);
    const formatDuration = (duration: number | undefined): string =>
      duration === undefined || !Number.isFinite(duration)
        ? ''
        : battleLog.durationTurns.replace('{turns}', String(duration));
    const getEffectText = (effect: LogEffect, targetName?: string): string => {
      const target = (value: ActionTarget): string =>
        getTargetLabel(value, targetName);

      switch (effect.kind) {
        case LogEffectKind.damage:
          return battleLog.damage
            .replace('{target}', target(effect.target))
            .replace('{value}', String(effect.value))
            .replace('{crit}', effect.isCrit ? battleLog.crit : '');
        case LogEffectKind.dodge:
          return battleLog.dodge.replace('{target}', target(effect.target));
        case LogEffectKind.heal:
          return battleLog.heal.replace('{value}', String(effect.value));
        case LogEffectKind.lifesteal:
          return battleLog.lifesteal.replace('{value}', String(effect.value));
        case LogEffectKind.bleed:
          return battleLog.bleed.replace('{value}', String(effect.value));
        case LogEffectKind.poison:
          return battleLog.poison.replace('{value}', String(effect.value));
        case LogEffectKind.regeneration:
          return battleLog.regeneration.replace(
            '{value}',
            String(effect.value)
          );
        case LogEffectKind.thorns:
          return battleLog.thorns.replace('{value}', String(effect.value));
        case LogEffectKind.leech:
          return battleLog.leech.replace('{value}', String(effect.value));
        case LogEffectKind.cleanse:
          return battleLog.cleanse;
        case LogEffectKind.reduce_cooldowns:
          return battleLog.reduceCooldowns.replace(
            '{value}',
            String(effect.value)
          );
        case LogEffectKind.resist:
          return battleLog.resist
            .replace('{target}', target(effect.target))
            .replace('{status}', effectLabels[effect.status]);
        case LogEffectKind.reflect:
          return battleLog.reflect.replace('{target}', target(effect.target));
        case LogEffectKind.apply_status: {
          const value =
            'value' in effect && effect.value !== undefined
              ? ` (${effect.value})`
              : '';
          const duration = formatDuration(
            'duration' in effect ? effect.duration : undefined
          );
          return battleLog.applyStatus
            .replace('{target}', target(effect.target))
            .replace('{status}', effectLabels[effect.status])
            .replace('{value}', value)
            .replace('{duration}', duration);
        }
        case LogEffectKind.modify_stat:
          return battleLog.modifyStat
            .replace('{target}', target(effect.target))
            .replace('{sign}', effect.value >= 0 ? '+' : '')
            .replace('{value}', String(effect.value))
            .replace('{stat}', getStatLabel(effect.stat, statLabels))
            .replace('{duration}', formatDuration(effect.duration));
      }
    };
    const getEffectClass = (effect: LogEffect): string | undefined => {
      switch (effect.kind) {
        case LogEffectKind.damage:
        case LogEffectKind.bleed:
        case LogEffectKind.poison:
        case LogEffectKind.thorns:
          return styles.negative;
        case LogEffectKind.heal:
        case LogEffectKind.lifesteal:
        case LogEffectKind.regeneration:
        case LogEffectKind.leech:
          return styles.positive;
        case LogEffectKind.dodge:
        case LogEffectKind.resist:
        case LogEffectKind.reflect:
          return styles.dodge;
        default:
          return undefined;
      }
    };

    return [...steps].reverse().map(step => ({
      step,
      effects: step.effects.map(effect => ({
        effect,
        text: getEffectText(effect, step.targetName),
        className: getEffectClass(effect),
      })),
    }));
  }, [battleLog, effectLabels, statLabels, steps, util]);

  return (
    <div className={classNames(styles.panel, isOpen && styles.expanded)}>
      <button
        className={styles.toggle}
        onClick={() => setIsOpen(open => !open)}
      >
        <span>{battleLog.title}</span>
        <span>{isOpen ? '▴' : '▾'}</span>
      </button>
      {isOpen && (
        <div className={styles.content}>
          {entries.length === 0 ? (
            <p className={styles.empty}>{battleLog.noActionsYet}</p>
          ) : (
            entries.map(({ step, effects }) => (
              <div key={step.step} className={styles.stepSection}>
                <p className={styles.stepHeader}>
                  {battleLog.turnLabel} {step.step} &mdash; {step.playerName}{' '}
                  {battleLog.used} {getSkillName(step.skillId, skillNames)}
                </p>
                {effects.map(({ effect, text, className }) => (
                  <p
                    key={`${step.step}-${effect.kind}-${text}`}
                    className={classNames(styles.effectRow, className)}
                  >
                    {text}
                  </p>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default memo(BattleLog);
