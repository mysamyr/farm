import { type CSSProperties, type ReactElement, useState } from 'react';

import { classNames } from '@game/client-core/utils';

import styles from './HealthBar.module.css';

type HealthBarProps = {
  current: number;
  max: number;
  label: string;
};

export default function HealthBar({
  current,
  max,
  label,
}: HealthBarProps): ReactElement {
  const safeMax = Math.max(max, 1);
  const value = Math.min(Math.max(current, 0), safeMax);
  const [settled, setSettled] = useState(value);

  const toPercent = (hp: number): number =>
    Math.min(Math.max((hp / safeMax) * 100, 0), 100);

  const delta = value - settled;
  const filled = Math.min(settled, value);
  const deltaStyle = {
    left: `${toPercent(filled)}%`,
    '--delta-width': `${toPercent(Math.abs(delta))}%`,
  } as CSSProperties;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>
          {value} / {max}
        </span>
      </div>
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${toPercent(filled)}%` }}
        />
        {delta !== 0 && (
          <div
            key={`${settled}-${value}`}
            className={classNames(
              styles.delta,
              delta < 0 ? styles.damage : styles.heal
            )}
            style={deltaStyle}
            onAnimationEnd={() => setSettled(value)}
          />
        )}
      </div>
    </div>
  );
}
