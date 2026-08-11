import { useEffect } from 'react';

import { LOCAL_STORAGE_KEY } from '@game/client-core/constants';
import { useLanguage, useRoom, useSnackbar } from '@game/client-core/hooks';
import { subscribe, unsubscribe } from '@game/client-core/socket';

import { EVENTS, GameId, NOTIFICATION_TYPES } from '@game/shared/constants';
import type {
  GameStateUpdatePayload,
  ServerNotification,
} from '@game/shared/types';

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
    const handleGameUpdate = ({ state }: GameStateUpdatePayload): void => {
      setCurrentRoom(state);
    };

    const handleNotification = ({ type, data }: ServerNotification): void => {
      if (currentRoom?.game !== GameId.arena) {
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

    subscribe(EVENTS.GAME_STATE_UPDATE, handleGameUpdate);
    subscribe(EVENTS.NOTIFICATION, handleNotification);

    return () => {
      unsubscribe(EVENTS.GAME_STATE_UPDATE, handleGameUpdate);
      unsubscribe(EVENTS.NOTIFICATION, handleNotification);
    };
  }, [onCurrentUserWon, setCurrentRoom]);
}
