import { useEffect } from 'react';

import { LOCAL_STORAGE_KEY } from '@game/client-core/constants';
import { useLanguage, useRoom, useSnackbar } from '@game/client-core/hooks';
import {
  subscribe,
  subscribeGameEvent,
  unsubscribe,
  unsubscribeGameEvent,
} from '@game/client-core/socket';

import { EVENTS, NOTIFICATION_TYPES } from '@game/shared/constants';
import type { ServerNotification } from '@game/shared/types';

import { ARENA_EVENTS, type Room } from '@game/game-arena/shared';

type UseGameSubscriptionsArgs = {
  onCurrentUserWon: () => void;
};

export function useGameSubscriptions({
  onCurrentUserWon,
}: UseGameSubscriptionsArgs): void {
  const { currentRoom, setCurrentRoom } = useRoom();
  const { showSnackbar } = useSnackbar();
  const { translation } = useLanguage();

  useEffect(() => {
    const handleGameUpdate = ({ room }: { room: Room }): void => {
      setCurrentRoom(room);
    };

    const handleNotification = ({ type, data }: ServerNotification): void => {
      if (currentRoom?.game !== 'arena') {
        return;
      }

      if (type === NOTIFICATION_TYPES.GAME_FINISHED) {
        const name = window.localStorage.getItem(LOCAL_STORAGE_KEY.USERNAME);
        const isCurrentUser = name === data;

        if (!isCurrentUser) {
          showSnackbar(translation.notifications.gameFinished(data));
        } else {
          onCurrentUserWon();
        }
        return;
      }
    };

    subscribeGameEvent(ARENA_EVENTS.GAME_UPDATE, handleGameUpdate);
    subscribe(EVENTS.NOTIFICATION, handleNotification);

    return () => {
      unsubscribeGameEvent(ARENA_EVENTS.GAME_UPDATE, handleGameUpdate);
      unsubscribe(EVENTS.NOTIFICATION, handleNotification);
    };
  }, [onCurrentUserWon, setCurrentRoom]);
}
