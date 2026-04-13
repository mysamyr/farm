import { useEffect } from 'react';

import { NOTIFICATION_TYPES } from '@game/shared/constants';
import { FARM_EVENTS } from '@game/shared/constants/farm';
import type { Room } from '@game/shared/types/farm';
import { useNavigate } from 'react-router-dom';

import { LOCAL_STORAGE_KEY, PATHS } from '../constants';
import { emitEvent, getSocketId, subscribe } from '../socket/client';

import { useConnection } from './useConnection';
import { useLanguage } from './useLanguage';
import { useRoom } from './useRoom';
import { useSnackbar } from './useSnackbar';

type UseSocketSubscriptionsArgs = {
  onCurrentUserWon: () => void;
};

export function useSocketSubscriptions({
  onCurrentUserWon,
}: UseSocketSubscriptionsArgs): void {
  const navigate = useNavigate();
  const { setRooms, setCurrentRoom } = useRoom();
  const { showSnackbar } = useSnackbar();
  const { translation } = useLanguage();
  const { setOnline } = useConnection();

  useEffect(() => {
    subscribe(FARM_EVENTS.CONNECT, (): void => {
      const name = window.localStorage.getItem(LOCAL_STORAGE_KEY.USERNAME);
      if (name) {
        emitEvent(FARM_EVENTS.PLAYER_RENAME, { name });
      }
    });

    subscribe<Room[]>(FARM_EVENTS.ROOMS_LIST, (nextRooms: Room[]): void => {
      setRooms(prevRooms => {
        const changed = JSON.stringify(prevRooms) !== JSON.stringify(nextRooms);
        return changed ? nextRooms : prevRooms;
      });

      const updatedCurrentRoom =
        nextRooms.find(room =>
          room.players.some(player => player.id === getSocketId())
        ) || null;
      setCurrentRoom(updatedCurrentRoom);
    });

    subscribe(FARM_EVENTS.ROOM_CLOSE, (): void => {
      setCurrentRoom(null);
    });

    subscribe<{ room: Room }>(
      FARM_EVENTS.GAME_STARTED,
      ({ room }: { room: Room }): void => {
        setCurrentRoom(room);
        void navigate(`${PATHS.GAME_BOARD}?roomId=${room.id}`);
      }
    );

    subscribe<{ room: Room }>(
      FARM_EVENTS.GAME_UPDATE,
      ({ room }: { room: Room }): void => {
        setCurrentRoom(room);
      }
    );

    subscribe<{ type: NOTIFICATION_TYPES; data: string }>(
      FARM_EVENTS.NOTIFICATION,
      ({ type, data }): void => {
        const name = window.localStorage.getItem(LOCAL_STORAGE_KEY.USERNAME);
        const isCurrentUser = name === data;

        if (!isCurrentUser) {
          switch (type) {
            case NOTIFICATION_TYPES.PLAYER_JOINED:
              showSnackbar(translation.notifications.playerJoined(data));
              break;
            case NOTIFICATION_TYPES.PLAYER_LEFT:
              showSnackbar(translation.notifications.playerLeft(data));
              break;
            case NOTIFICATION_TYPES.CLOSE_ROOM:
              showSnackbar(translation.notifications.roomClosed(data));
              break;
            case NOTIFICATION_TYPES.GAME_FINISHED:
              showSnackbar(translation.notifications.gameFinished(data));
              break;
            default:
              break;
          }
          return;
        }

        if (type === NOTIFICATION_TYPES.GAME_FINISHED) {
          onCurrentUserWon();
        }
      }
    );

    subscribe<number>(FARM_EVENTS.ONLINE_COUNT, (online: number): void => {
      setOnline(online);
    });
  }, []);
}
