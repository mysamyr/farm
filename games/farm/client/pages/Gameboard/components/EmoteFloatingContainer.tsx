import { type ReactElement } from 'react';

import { useEmoteSubscription } from '../../../hooks/useEmoteSubscription.js';

import EmoteAnimation from './EmoteAnimation.js';

import styles from './EmoteFloatingContainer.module.css';

export default function EmoteFloatingContainer(): ReactElement {
  const { activeEmotes, handleAnimationEnd } = useEmoteSubscription();

  return (
    <div className={styles.container}>
      {activeEmotes.map(emote => (
        <EmoteAnimation
          key={emote.key}
          emoteId={emote.emoteId}
          onAnimationEnd={() => handleAnimationEnd(emote.key)}
        />
      ))}
    </div>
  );
}
