import React, { useEffect, useRef } from 'react';

import { EMOTES } from '@game/shared/constants/farm';
import type { EmoteId } from '@game/shared/types/farm';

import styles from './EmoteAnimation.module.css';

interface EmoteAnimationProps {
  emoteId: EmoteId;
  onAnimationEnd?: () => void;
}

export default function EmoteAnimation({
  emoteId,
  onAnimationEnd,
}: EmoteAnimationProps): React.ReactElement {
  const leftRef = useRef<number | null>(null);

  if (leftRef.current === null) {
    const maxLeft = Math.max(window.innerWidth - 80, 0);
    leftRef.current = Math.random() * maxLeft;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationEnd?.();
    }, 2500); // 2s float + 0.5s fade

    return () => clearTimeout(timer);
  }, [onAnimationEnd]);

  const emote = EMOTES.find(e => e.id === emoteId);

  if (!emote) {
    return <></>;
  }

  return (
    <div className={styles.emote} style={{ left: `${leftRef.current}px` }}>
      {emote.emoji}
    </div>
  );
}
