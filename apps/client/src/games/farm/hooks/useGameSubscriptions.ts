import { useEffect } from 'react';

import { EVENTS } from '@game/shared/constants';
import {
  FARM_EVENTS,
  FARM_NOTIFICATION_TYPES,
} from '@game/shared/constants/farm';
import type { RoomPayload, ServerNotification } from '@game/shared/types';

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
    const handleGameUpdate = ({ room }: RoomPayload): void => {
      setCurrentRoom(room);
    };

    const handleNotification = ({ type, data }: ServerNotification): void => {
      if (currentRoom?.game !== 'farm') {
        return;
      }

      if (type === FARM_NOTIFICATION_TYPES.GAME_FINISHED) {
        const name = window.localStorage.getItem(LOCAL_STORAGE_KEY.USERNAME);
        const isCurrentUser = name === data;

        if (!isCurrentUser) {
          showSnackbar(translation.notifications.gameFinished(data));
        } else {
          onCurrentUserWon();
        }
        return;
      }

      if (type === FARM_NOTIFICATION_TYPES.TRADE_CANCELLED) {
        showSnackbar(translation.notifications.tradeCancelled(data));
      }
    };

    subscribe(FARM_EVENTS.GAME_UPDATE, handleGameUpdate);
    subscribe(EVENTS.NOTIFICATION, handleNotification);

    return () => {
      unsubscribe(FARM_EVENTS.GAME_UPDATE, handleGameUpdate);
      unsubscribe(EVENTS.NOTIFICATION, handleNotification);
    };
  }, [
    currentRoom?.game,
    onCurrentUserWon,
    setCurrentRoom,
    showSnackbar,
    translation.notifications,
  ]);
}
