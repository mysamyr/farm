import type { ReactElement } from 'react';

import { useWinningAnimation } from '../../hooks/useWinningAnimation';

import { classNames } from '../../utils';

import styles from './WinningAnimation.module.css';

type WinningAnimationProps = {
  title: string;
};

export default function WinningAnimation({ title }: WinningAnimationProps): ReactElement {
  const { show, isExiting, confettiPieces, close } = useWinningAnimation();

  if (!show) {
    return <></>;
  }

  return (
    <div
      className={classNames(styles.container, isExiting && styles.fadeOut)}
      onClick={close}
    >
      <div className={styles.title}>🎉 {title} 🎉</div>
      <div className={styles.confettiContainer}>
        {confettiPieces.map((piece, index) => (
          <div
            key={`${piece.left}-${piece.animationDelay}-${index}`}
            className={styles.confetti}
            style={{ left: piece.left, animationDelay: piece.animationDelay }}
          />
        ))}
      </div>
    </div>
  );
}
