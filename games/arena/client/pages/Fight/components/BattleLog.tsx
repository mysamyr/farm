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
  const { battleLog, effects, statLabels, skillNames, util } = t;
  const [isOpen, setIsOpen] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(min-width: 1024px)').matches
  );

  const entries = useMemo(() => {
    const formatDuration = (duration: number | undefined): string =>
      duration === undefined || !Number.isFinite(duration)
        ? ''
        : battleLog.durationTurns.replace('{turns}', String(duration));
    const getEffectText = (effect: LogEffect, step: LogStep): string => {
      let message = battleLog.messages[effect.kind];
      if (effect.kind === LogEffectKind.apply_status) {
        const value =
          'value' in effect &&
          typeof effect.value === 'number' &&
          effects[effect.status].value
            ? ` (${effect.value})`
            : '';
        message = message.replace('{value}', value);
      } else if ('value' in effect && typeof effect.value === 'number') {
        message = message.replace('{value}', String(effect.value));
      }
      if ('status' in effect) {
        message = message.replace('{status}', effects[effect.status].name);
      }
      if (effect.kind === LogEffectKind.modify_stat) {
        message = message
          .replace('{sign}', effect.value >= 0 ? '+' : '')
          .replace('{stat}', getStatLabel(effect.stat, statLabels));
      }
      if (effect.kind === LogEffectKind.damage) {
        message = message.replace(
          '{crit}',
          effect.isCrit ? battleLog.crit : ''
        );
      }
      const duration =
        'duration' in effect && typeof effect.duration === 'number'
          ? effect.duration
          : undefined;
      message = message.replace('{duration}', formatDuration(duration));

      const target =
        effect.target === ActionTarget.self
          ? step.playerName
          : (step.targetName ?? util.opponent);
      return battleLog.row
        .replace('{target}', target)
        .replace('{message}', message);
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
        text: getEffectText(effect, step),
        className: getEffectClass(effect),
      })),
    }));
  }, [battleLog, effects, statLabels, steps, util]);

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
