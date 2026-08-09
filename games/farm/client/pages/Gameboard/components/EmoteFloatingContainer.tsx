import { useCallback, useEffect, useState, ReactElement } from 'react';

import {
  subscribeGameEvent,
  unsubscribeGameEvent,
} from '@game/client-core/socket';

import {
  FARM_EVENTS,
  type EmoteSentPayload,
  type EmoteId,
} from '@game/game-farm/shared';

import EmoteAnimation from './EmoteAnimation';

import styles from './EmoteFloatingContainer.module.css';

type ActiveEmote = {
  key: string;
  emoteId: EmoteId;
};

export default function EmoteFloatingContainer(): ReactElement {
  const [activeEmotes, setActiveEmotes] = useState<ActiveEmote[]>([]);

  const handleEmoteReceived = useCallback((payload: EmoteSentPayload): void => {
    const newEmote: ActiveEmote = {
      key: `${Date.now()}-${Math.random()}`,
      emoteId: payload.emoteId,
    };
    setActiveEmotes(prev => [...prev, newEmote]);
  }, []);

  const handleAnimationEnd = useCallback((key: string): void => {
    setActiveEmotes(prev => prev.filter(e => e.key !== key));
  }, []);

  useEffect(() => {
    subscribeGameEvent(FARM_EVENTS.GAME_EMOTE_SENT, handleEmoteReceived);

    return () => {
      unsubscribeGameEvent(FARM_EVENTS.GAME_EMOTE_SENT, handleEmoteReceived);
    };
  }, [handleEmoteReceived]);

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
