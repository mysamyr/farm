import { useState, type ReactElement } from 'react';

import { classNames } from '@game/client-core/utils';

import type { LogEffect, LogStep } from '@game/game-arena/shared';

import { useArenaTranslation } from '../../../hooks/useArenaTranslation.js';

import styles from './BattleLog.module.css';

type BattleLogProps = {
  steps: LogStep[];
};

function formatSkillId(id: string): string {
  return id.replace(/_/g, ' ');
}

function getEffectText(effect: LogEffect): string {
  switch (effect.kind) {
    case 'damage':
      return `Opponent: ${effect.value} damage${effect.isCrit ? ' (crit)' : ''}`;
    case 'dodge':
      return 'Opponent: dodged';
    case 'heal':
      return `+${effect.value} heal`;
    case 'lifesteal':
      return `+${effect.value} lifesteal`;
    case 'bleed':
      return `-${effect.value} bleed`;
    case 'poison':
      return `-${effect.value} poison`;
    case 'regeneration':
      return `+${effect.value} regeneration`;
    case 'thorns':
      return `-${effect.value} thorns`;
    default:
      return '';
  }
}

function getEffectClass(effect: LogEffect): string | undefined {
  switch (effect.kind) {
    case 'damage':
    case 'bleed':
    case 'poison':
    case 'thorns':
      return styles.negative;
    case 'heal':
    case 'lifesteal':
    case 'regeneration':
      return styles.positive;
    case 'dodge':
      return styles.dodge;
    default:
      return '';
  }
}

export default function BattleLog({ steps }: BattleLogProps): ReactElement {
  const { battleLog: t } = useArenaTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.panel}>
      <button className={styles.toggle} onClick={() => setIsOpen(o => !o)}>
        <span>{t.title}</span>
        <span>{isOpen ? '▴' : '▾'}</span>
      </button>
      {isOpen && (
        <div className={styles.content}>
          {steps.length === 0 ? (
            <p className={styles.empty}>{t.noActionsYet}</p>
          ) : (
            [...steps].reverse().map(step => (
              <div key={step.step} className={styles.stepSection}>
                <p className={styles.stepHeader}>
                  {t.turnLabel} {step.step} &mdash; {step.playerName} {t.used}{' '}
                  {formatSkillId(step.skillId)}
                </p>
                {step.effects.map((effect, i) => (
                  <p
                    key={i}
                    className={classNames(
                      styles.effectRow,
                      getEffectClass(effect)
                    )}
                  >
                    {getEffectText(effect)}
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
