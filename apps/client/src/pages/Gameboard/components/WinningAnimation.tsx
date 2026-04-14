import type { ReactElement } from 'react';

import { useLanguage } from '../../../hooks/useLanguage';
import { useWinningAnimation } from '../../../hooks/useWinningAnimation';

import { classNames } from '../../../utils';

import styles from './WinningAnimation.module.css';

export default function WinningAnimation(): ReactElement {
  const { show, isExiting, confettiPieces, close } = useWinningAnimation();
  const { translation } = useLanguage();

  if (!show) {
    return <></>;
  }

  return (
    <div
      className={classNames(styles.container, isExiting && styles.fadeOut)}
      onClick={close}
    >
      <div className={styles.title}>🎉 {translation.youWin} 🎉</div>
      <div className={styles.confettiContainer}>
        {confettiPieces.map((piece, index) => (
          <div
            key={`${piece.left}-${piece.animationDelay}-${index}`}
            className={styles.confetti}
            style={{
              left: piece.left,
              backgroundColor: piece.color,
              animationDelay: piece.animationDelay,
            }}
          />
        ))}
      </div>
    </div>
  );
}
