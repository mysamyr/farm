import { type ReactElement } from 'react';

import { classNames } from '@game/client-core/utils';

import { useArenaTranslation } from '../../../hooks/useArenaTranslation.js';

import styles from './TurnBanner.module.css';

type TurnBannerProps = {
  isGameOver: boolean;
  winnerName?: string;
  isSelfEliminated: boolean;
  isMyTurn: boolean;
  isStunned: boolean;
  activePlayerName?: string;
  targetName?: string;
  showTargetHint: boolean;
};

export default function TurnBanner({
  isGameOver,
  winnerName,
  isSelfEliminated,
  isMyTurn,
  isStunned,
  activePlayerName,
  targetName,
  showTargetHint,
}: TurnBannerProps): ReactElement {
  const t = useArenaTranslation();

  const { text, tone } = ((): {
    text: string;
    tone: 'action' | 'waiting' | 'ended';
  } => {
    if (isGameOver) {
      return {
        text: winnerName
          ? t.fight.winnerPrompt.replace('{name}', winnerName)
          : t.fight.gameOverBadge,
        tone: 'ended',
      };
    }

    if (isSelfEliminated) {
      return { text: t.fight.eliminatedPrompt, tone: 'ended' };
    }

    if (isMyTurn) {
      if (isStunned) return { text: t.fight.stunnedPrompt, tone: 'action' };

      return {
        text: targetName
          ? t.fight.yourTurnPrompt.replace('{target}', targetName)
          : t.fight.yourTurnNoTargetPrompt,
        tone: 'action',
      };
    }

    return {
      text: activePlayerName
        ? t.fight.otherTurnPrompt.replace('{name}', activePlayerName)
        : t.fight.opponentTurnBadge,
      tone: 'waiting',
    };
  })();

  return (
    <div
      className={classNames(
        styles.banner,
        tone === 'action' && styles.action,
        tone === 'waiting' && styles.waiting,
        tone === 'ended' && styles.ended
      )}
      role="status"
      aria-live="polite"
    >
      <span className={styles.text}>{text}</span>
      {showTargetHint && (
        <span className={styles.hint}>{t.fight.selectTargetHint}</span>
      )}
    </div>
  );
}
