import { useState, type ReactElement } from 'react';

import { classNames } from '@game/client-core/utils';

import {
  ActionTarget,
  LogEffectKind,
  type LogEffect,
  type LogStep,
} from '@game/game-arena/shared';

import { getSkillName, getStatLabel } from '../../../constants/index.js';
import {
  useArenaTranslation,
  type ArenaBattleLogTranslation,
  type ArenaEffectLabelsTranslation,
  type ArenaStatLabelsTranslation,
  type UtilTranslation,
} from '../../../hooks/useArenaTranslation.js';

import styles from './BattleLog.module.css';

type BattleLogProps = {
  steps: LogStep[];
};

function getTargetLabel(
  target: ActionTarget,
  util: UtilTranslation
): string {
  return target === ActionTarget.self ? util.self : util.opponent;
}

function formatDuration(
  duration: number | undefined,
  t: ArenaBattleLogTranslation
): string {
  if (duration === undefined || !Number.isFinite(duration)) return '';
  return t.durationTurns.replace('{turns}', String(duration));
}

function getEffectText(
  effect: LogEffect,
  t: ArenaBattleLogTranslation,
  effectLabels: ArenaEffectLabelsTranslation,
  statLabels: ArenaStatLabelsTranslation,
  util: UtilTranslation
): string {
  switch (effect.kind) {
    case LogEffectKind.damage:
      return t.damage
        .replace('{target}', getTargetLabel(effect.target, util))
        .replace('{value}', String(effect.value))
        .replace('{crit}', effect.isCrit ? t.crit : '');
    case LogEffectKind.dodge:
      return t.dodge.replace(
        '{target}',
        getTargetLabel(effect.target, util)
      );
    case LogEffectKind.heal:
      return t.heal.replace('{value}', String(effect.value));
    case LogEffectKind.lifesteal:
      return t.lifesteal.replace('{value}', String(effect.value));
    case LogEffectKind.bleed:
      return t.bleed.replace('{value}', String(effect.value));
    case LogEffectKind.poison:
      return t.poison.replace('{value}', String(effect.value));
    case LogEffectKind.regeneration:
      return t.regeneration.replace('{value}', String(effect.value));
    case LogEffectKind.thorns:
      return t.thorns.replace('{value}', String(effect.value));
    case LogEffectKind.leech:
      return t.leech.replace('{value}', String(effect.value));
    case LogEffectKind.cleanse:
      return t.cleanse;
    case LogEffectKind.resist:
      return t.resist
        .replace('{target}', getTargetLabel(effect.target, util))
        .replace('{status}', effectLabels[effect.status]);
    case LogEffectKind.apply_status: {
      const value =
        'value' in effect && effect.value !== undefined
          ? ` (${effect.value})`
          : '';
      const duration = formatDuration(
        'duration' in effect ? effect.duration : undefined,
        t
      );
      return t.applyStatus
        .replace('{target}', getTargetLabel(effect.target, util))
        .replace('{status}', effectLabels[effect.status])
        .replace('{value}', value)
        .replace('{duration}', duration);
    }
    case LogEffectKind.modify_stat: {
      const sign = effect.value >= 0 ? '+' : '';
      return t.modifyStat
        .replace('{target}', getTargetLabel(effect.target, util))
        .replace('{sign}', sign)
        .replace('{value}', String(effect.value))
        .replace('{stat}', getStatLabel(effect.stat, statLabels))
        .replace('{duration}', formatDuration(effect.duration, t));
    }
  }
}

function getEffectClass(effect: LogEffect): string | undefined {
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
      return styles.dodge;
    case LogEffectKind.cleanse:
    case LogEffectKind.apply_status:
    case LogEffectKind.modify_stat:
      return undefined;
  }
}

export default function BattleLog({ steps }: BattleLogProps): ReactElement {
  const t = useArenaTranslation();
  const { battleLog, effectLabels, statLabels, skillNames, util } = t;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.panel}>
      <button className={styles.toggle} onClick={() => setIsOpen(o => !o)}>
        <span>{battleLog.title}</span>
        <span>{isOpen ? '▴' : '▾'}</span>
      </button>
      {isOpen && (
        <div className={styles.content}>
          {steps.length === 0 ? (
            <p className={styles.empty}>{battleLog.noActionsYet}</p>
          ) : (
            [...steps].reverse().map(step => (
              <div key={step.step} className={styles.stepSection}>
                <p className={styles.stepHeader}>
                  {battleLog.turnLabel} {step.step} &mdash; {step.playerName}{' '}
                  {battleLog.used} {getSkillName(step.skillId, skillNames)}
                </p>
                {step.effects.map((effect, i) => (
                  <p
                    key={i}
                    className={classNames(
                      styles.effectRow,
                      getEffectClass(effect)
                    )}
                  >
                    {getEffectText(
                      effect,
                      battleLog,
                      effectLabels,
                      statLabels,
                      util
                    )}
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
