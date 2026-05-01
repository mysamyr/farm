import { useEffect } from 'react';

import { EVENTS, NOTIFICATION_TYPES } from '@game/shared/constants';
import { FARM_EVENTS } from '@game/shared/constants/farm';
import type { RoomPayload, ServerNotification } from '@game/shared/types';

import { LOCAL_STORAGE_KEY } from '../../../constants';
import { useLanguage } from '../../../hooks/useLanguage';
import { useRoom } from '../../../hooks/useRoom';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { subscribe } from '../../../socket/client';

type UseGameSubscriptionsArgs = {
  onCurrentUserWon: () => void;
};

export function useGameSubscriptions({
  onCurrentUserWon,
}: UseGameSubscriptionsArgs): void {
  const { setCurrentRoom } = useRoom();
  const { showSnackbar } = useSnackbar();
  const { translation } = useLanguage();

  useEffect(() => {
    subscribe(FARM_EVENTS.GAME_UPDATE, ({ room }: RoomPayload): void => {
      setCurrentRoom(room);
    });

    subscribe(
      EVENTS.NOTIFICATION,
      ({ type, data }: ServerNotification): void => {
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

        if (type === NOTIFICATION_TYPES.TRADE_CANCELLED) {
          showSnackbar(translation.notifications.tradeCancelled(data));
        }
      }
    );
  }, []);
}
