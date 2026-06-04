import { useEffect } from 'react';

import { EVENTS, NOTIFICATION_TYPES } from '@game/shared/constants';
import { ARENA_EVENTS } from '@game/shared/constants/arena';
import type { ServerNotification } from '@game/shared/types';
import type { Room } from '@game/shared/types/arena';

import { LOCAL_STORAGE_KEY } from '../../../constants';
import { useLanguage } from '../../../hooks/useLanguage';
import { useRoom } from '../../../hooks/useRoom';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { subscribe, unsubscribe } from '../../../socket/client';

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

    subscribe(ARENA_EVENTS.GAME_UPDATE, handleGameUpdate);
    subscribe(EVENTS.NOTIFICATION, handleNotification);

    return () => {
      unsubscribe(ARENA_EVENTS.GAME_UPDATE, handleGameUpdate);
      unsubscribe(EVENTS.NOTIFICATION, handleNotification);
    };
  }, [onCurrentUserWon, setCurrentRoom]);
}
