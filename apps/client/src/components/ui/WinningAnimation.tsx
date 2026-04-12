import type { ReactElement } from 'react';

import { useWinningAnimation } from '../../hooks/useWinningAnimation';

type WinningAnimationProps = {
  title: string;
};

function WinningAnimation({
  title,
}: WinningAnimationProps): ReactElement | null {
  const { show, isExiting, confettiPieces, close } = useWinningAnimation();

  if (!show) {
    return null;
  }

  return (
    <div
      className={`winner-animation-container ${isExiting ? 'fade-out' : ''}`.trim()}
      onClick={close}
    >
      <div className="winner-title">🎉 {title} 🎉</div>
      <div className="confetti-container">
        {confettiPieces.map((piece, index) => (
          <div
            key={`${piece.left}-${piece.animationDelay}-${index}`}
            className="confetti"
            style={{ left: piece.left, animationDelay: piece.animationDelay }}
          />
        ))}
      </div>
    </div>
  );
}

export default WinningAnimation;
