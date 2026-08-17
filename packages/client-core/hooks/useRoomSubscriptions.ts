import { useEffect, useRef } from 'react';

import {
  EVENTS,
  NOTIFICATION_TYPES,
  ROOM_STATES,
} from '@game/shared/constants';
import type {
  GameErrorPayload,
  GameStateUpdatePayload,
  RoomPayload,
  ServerNotification,
} from '@game/shared/types';

import { useLocation, useNavigate } from 'react-router-dom';

import {
  LOCAL_STORAGE_KEY,
  PATHS,
  getDashboardPath,
} from '../constants/index.js';
import { emitEvent, getSocketId, subscribe } from '../socket/index.js';
import { resolveErrorMessage } from '../utils/index.js';

import { useConnection } from './useConnection.js';
import { useLanguage } from './useLanguage.js';
import { useRoom } from './useRoom.js';
import { useSnackbar } from './useSnackbar.js';

export function useRoomSubscriptions(): void {
  const navigate = useNavigate();
  const location = useLocation();
  const locationRef = useRef(location);
  locationRef.current = location;
  const { setRooms, setCurrentRoom } = useRoom();
  const { showSnackbar } = useSnackbar();
  const { translation } = useLanguage();
  const { setOnline } = useConnection();
  const previousRoomStateRef = useRef<ROOM_STATES | null>(null);

  useEffect(() => {
    const navigateToLobbyIfFinished = (
      nextState: ROOM_STATES,
      gameId?: string
    ): void => {
      if (
        previousRoomStateRef.current === ROOM_STATES.FINISHED &&
        nextState === ROOM_STATES.IDLE
      ) {
        void navigate(getDashboardPath(gameId));
      }
      previousRoomStateRef.current = nextState;
    };

    subscribe(EVENTS.CONNECT, (): void => {
      const name = window.localStorage.getItem(LOCAL_STORAGE_KEY.USERNAME);
      if (name) {
        emitEvent(EVENTS.PLAYER_RENAME, { name });
      }

      emitEvent(EVENTS.ROOM_REJOIN, null, res => {
        if (res.ok && res.room) {
          setCurrentRoom(res.room);
          previousRoomStateRef.current = res.room.state;
          if (res.room.state === ROOM_STATES.IDLE) {
            void navigate(getDashboardPath(res.room.game));
          } else {
            void navigate(
              `${PATHS.GAME_BOARD}?game=${res.room.game}&roomId=${res.room.id}`
            );
          }
        } else {
          previousRoomStateRef.current = null;
          const { pathname, search } = locationRef.current;
          if (pathname === PATHS.DASHBOARD) {
            return;
          }

          const gameId = new URLSearchParams(search).get('game') ?? undefined;
          void navigate(getDashboardPath(gameId), { replace: true });
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
        navigateToLobbyIfFinished(
          updatedCurrentRoom.state,
          updatedCurrentRoom.game
        );
      } else {
        previousRoomStateRef.current = null;
        setCurrentRoom(null);
      }
    });

    subscribe(EVENTS.ROOM_CLOSED, (): void => {
      previousRoomStateRef.current = null;
      setCurrentRoom(null);
    });

    subscribe(EVENTS.GAME_STARTED, ({ room }: RoomPayload): void => {
      previousRoomStateRef.current = room.state;
      setCurrentRoom(room);
      void navigate(`${PATHS.GAME_BOARD}?game=${room.game}&roomId=${room.id}`);
    });

    subscribe(
      EVENTS.GAME_STATE_UPDATE,
      ({ state }: GameStateUpdatePayload): void => {
        navigateToLobbyIfFinished(state.state, state.game);
      }
    );

    subscribe(
      EVENTS.NOTIFICATION,
      ({ type, data }: ServerNotification): void => {
        const name = window.localStorage.getItem(LOCAL_STORAGE_KEY.USERNAME);
        const isCurrentUser = name === data;

        if (type === NOTIFICATION_TYPES.PLAYER_KICKED) {
          if (isCurrentUser) {
            showSnackbar(translation.notifications.youWereKicked);
          } else {
            showSnackbar(translation.notifications.playerKicked(data));
          }
          return;
        }

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
