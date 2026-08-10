import { useEffect } from 'react';

import { EVENTS, NOTIFICATION_TYPES } from '@game/shared/constants';
import type {
  GameErrorPayload,
  RoomPayload,
  ServerNotification,
} from '@game/shared/types';

import { useNavigate } from 'react-router-dom';

import { LOCAL_STORAGE_KEY, PATHS } from '../constants/index.js';
import { emitEvent, getSocketId, subscribe } from '../socket/index.js';
import { resolveErrorMessage } from '../utils/index.js';

import { useConnection } from './useConnection.js';
import { useLanguage } from './useLanguage.js';
import { useRoom } from './useRoom.js';
import { useSnackbar } from './useSnackbar.js';

export function useRoomSubscriptions(): void {
  const navigate = useNavigate();
  const { setRooms, setCurrentRoom } = useRoom();
  const { showSnackbar } = useSnackbar();
  const { translation } = useLanguage();
  const { setOnline } = useConnection();

  useEffect(() => {
    subscribe(EVENTS.CONNECT, (): void => {
      const name = window.localStorage.getItem(LOCAL_STORAGE_KEY.USERNAME);
      if (name) {
        emitEvent(EVENTS.PLAYER_RENAME, { name });
      }

      emitEvent(EVENTS.ROOM_REJOIN, null, res => {
        if (res.ok && res.room) {
          setCurrentRoom(res.room);
          void navigate(
            `${PATHS.GAME_BOARD}?game=${res.room.game}&roomId=${res.room.id}`
          );
        } else {
          void navigate(PATHS.DASHBOARD);
        }
      });
    });

    subscribe(EVENTS.ROOMS_LIST, (nextRooms): void => {
      setRooms(prevRooms => {
        const changed = JSON.stringify(prevRooms) !== JSON.stringify(nextRooms);
        return changed ? nextRooms : prevRooms;
      });

      const updatedCurrentRoom = nextRooms.find(room =>
        room.players.some(player => player.id === getSocketId())
      );

      if (updatedCurrentRoom) {
        setCurrentRoom(updatedCurrentRoom);
      } else {
        setCurrentRoom(null);
      }
    });

    subscribe(EVENTS.ROOM_CLOSED, (): void => {
      setCurrentRoom(null);
    });

    subscribe(EVENTS.GAME_STARTED, ({ room }: RoomPayload): void => {
      setCurrentRoom(room);
      void navigate(`${PATHS.GAME_BOARD}?game=${room.game}&roomId=${room.id}`);
    });

    subscribe(
      EVENTS.NOTIFICATION,
      ({ type, data }: ServerNotification): void => {
        const name = window.localStorage.getItem(LOCAL_STORAGE_KEY.USERNAME);
        const isCurrentUser = name === data;

        if (isCurrentUser) return;

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
          default:
            break;
        }
      }
    );

    subscribe(EVENTS.GAME_ERROR, (payload: GameErrorPayload): void => {
      showSnackbar(
        resolveErrorMessage(payload.code, translation) ||
          `Error: ${payload.code}`
      );
    });

    subscribe(EVENTS.ONLINE_COUNT, (online: number): void => {
      setOnline(online);
    });
  }, []);
}
