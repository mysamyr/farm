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
  getGameBoardPath,
  getGameIdFromPathname,
  getGamePath,
  isCatalogPathname,
  isGameBoardPathname,
} from '../constants/index.js';
import {
  emitEvent,
  getSocketId,
  isSocketConnected,
  subscribe,
} from '../socket/index.js';
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
  const { setOnline, setRejoinSettled } = useConnection();
  const previousRoomStateRef = useRef<ROOM_STATES | null>(null);

  useEffect(() => {
    const navigateIfNeeded = (
      to: string,
      options?: { replace?: boolean }
    ): void => {
      if (locationRef.current.pathname === to) {
        return;
      }
      void navigate(to, options);
    };

    const navigateToLobbyIfNeeded = (
      nextState: ROOM_STATES,
      gameId?: string
    ): void => {
      const prev = previousRoomStateRef.current;
      if (
        (prev === ROOM_STATES.FINISHED || prev === ROOM_STATES.RUNNING) &&
        nextState === ROOM_STATES.IDLE &&
        gameId
      ) {
        navigateIfNeeded(getGamePath(gameId));
      }
      previousRoomStateRef.current = nextState;
    };

    const handleConnect = (): void => {
      setRejoinSettled(false);

      const name = window.localStorage.getItem(LOCAL_STORAGE_KEY.USERNAME);
      if (name) {
        emitEvent(EVENTS.PLAYER_RENAME, { name });
      }

      emitEvent(EVENTS.ROOM_REJOIN, null, res => {
        if (res.ok && res.room) {
          setCurrentRoom(res.room);
          previousRoomStateRef.current = res.room.state;
          setRejoinSettled(true);
          if (res.room.state === ROOM_STATES.IDLE) {
            navigateIfNeeded(getGamePath(res.room.game), { replace: true });
          } else {
            navigateIfNeeded(getGameBoardPath(res.room.game), {
              replace: true,
            });
          }
          return;
        }

        previousRoomStateRef.current = null;
        setRejoinSettled(true);
        const { pathname } = locationRef.current;
        if (isCatalogPathname(pathname) || !isGameBoardPathname(pathname)) {
          return;
        }

        const gameId = getGameIdFromPathname(pathname);
        if (gameId) {
          navigateIfNeeded(getGamePath(gameId), { replace: true });
        }
      });
    };

    subscribe(EVENTS.CONNECT, handleConnect);
    if (isSocketConnected()) {
      handleConnect();
    }

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
        navigateToLobbyIfNeeded(
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
      navigateIfNeeded(getGameBoardPath(room.game));
    });

    subscribe(
      EVENTS.GAME_STATE_UPDATE,
      ({ state }: GameStateUpdatePayload): void => {
        navigateToLobbyIfNeeded(state.state, state.game);
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
          case NOTIFICATION_TYPES.RETURN_TO_LOBBY:
            showSnackbar(translation.notifications.returnedToLobby(data));
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
