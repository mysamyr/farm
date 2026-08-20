import { useCallback, useEffect, useState } from 'react';

import { subscribe, unsubscribe } from '@game/client-core/socket';
import { EVENTS } from '@game/shared/constants';
import type { GameEffectPayload } from '@game/shared/types';

import { type EmoteId } from '@game/game-farm/shared';

type ActiveEmote = {
  key: string;
  emoteId: EmoteId;
};

type UseEmoteSubscriptionReturn = {
  activeEmotes: ActiveEmote[];
  handleAnimationEnd: (key: string) => void;
};

export function useEmoteSubscription(): UseEmoteSubscriptionReturn {
  const [activeEmotes, setActiveEmotes] = useState<ActiveEmote[]>([]);

  const handleAnimationEnd = useCallback((key: string): void => {
    setActiveEmotes(prev => prev.filter(e => e.key !== key));
  }, []);

  useEffect(() => {
    const handleEffect = (payload: GameEffectPayload): void => {
      if (payload.type !== 'emote_sent') return;
      const data = payload.payload as { emoteId: EmoteId } | undefined;
      if (!data) return;

      setActiveEmotes(prev => [
        ...prev,
        { key: `${Date.now()}-${Math.random()}`, emoteId: data.emoteId },
      ]);
    };

    subscribe(EVENTS.GAME_EFFECT, handleEffect);

    return () => {
      unsubscribe(EVENTS.GAME_EFFECT, handleEffect);
    };
  }, []);

  return { activeEmotes, handleAnimationEnd };
}
