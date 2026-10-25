import { useEffect, useRef } from 'react';

import { LOCAL_STORAGE_KEY } from '@game/client-core/constants';
import { useLanguage, useRoom, useSnackbar } from '@game/client-core/hooks';
import { subscribe, unsubscribe } from '@game/client-core/socket';

import { EVENTS, GameId, NOTIFICATION_TYPES } from '@game/shared/constants';
import type {
  GameStateUpdatePayload,
  ServerNotification,
} from '@game/shared/types';

import { FARM_NOTIFICATION_TYPES } from '@game/game-farm/shared';

type UseGameSubscriptionsArgs = {
  onCurrentUserWon: () => void;
};

export function useGameSubscriptions({
  onCurrentUserWon,
}: UseGameSubscriptionsArgs): void {
  const { currentRoom, setCurrentRoom } = useRoom();
  const { showSnackbar } = useSnackbar();
  const { translation } = useLanguage();
  const currentRoomRef = useRef(currentRoom);
  const onCurrentUserWonRef = useRef(onCurrentUserWon);
  const showSnackbarRef = useRef(showSnackbar);
  const translationRef = useRef(translation);

  currentRoomRef.current = currentRoom;
  onCurrentUserWonRef.current = onCurrentUserWon;
  showSnackbarRef.current = showSnackbar;
  translationRef.current = translation;

  useEffect(() => {
    const handleGameUpdate = ({ state }: GameStateUpdatePayload): void => {
      setCurrentRoom(state);
    };

    const handleNotification = ({ type, data }: ServerNotification): void => {
      if (currentRoomRef.current?.game !== GameId.farm) {
        return;
      }

      if (type === NOTIFICATION_TYPES.GAME_FINISHED) {
        const name = window.localStorage.getItem(LOCAL_STORAGE_KEY.USERNAME);
        const isCurrentUser = name === data;

        if (isCurrentUser) {
          onCurrentUserWonRef.current();
        }
        return;
      }

      if (type === FARM_NOTIFICATION_TYPES.TRADE_CANCELLED) {
        showSnackbarRef.current(
          translationRef.current.notifications.tradeCancelled(data)
        );
      }
    };

    subscribe(EVENTS.GAME_STATE_UPDATE, handleGameUpdate);
    subscribe(EVENTS.NOTIFICATION, handleNotification);

    return () => {
      unsubscribe(EVENTS.GAME_STATE_UPDATE, handleGameUpdate);
      unsubscribe(EVENTS.NOTIFICATION, handleNotification);
    };
  }, [setCurrentRoom]);
}
