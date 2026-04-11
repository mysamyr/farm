import { EVENTS, NOTIFICATION_TYPES } from '@shared/constants';

import { LOCAL_STORAGE_KEY, PATHS } from './constants';
import { getLanguageConfig } from './features/language';
import Snackbar from './features/snackbar';
import WinningAnimation from './features/winning-animation';
import renderDashboard from './pages/Dashboard';
import {
  renderCurrentRoomSection,
  renderRooms,
} from './pages/Dashboard/render';
import renderGameBoard from './pages/Gameboard';
import { emitEvent, getSocketId, subscribe } from './socket/client';
import { state } from './state/store';
import { navTo, parseHash } from './utils/navigation';
import { setupUnloadWarning } from './utils/unload';

import type { Room } from '@shared/types';

function setupSocket(): void {
  subscribe(EVENTS.CONNECT, (): void => {
    console.log('Connected:', getSocketId());
    const name = localStorage.getItem(LOCAL_STORAGE_KEY.USERNAME);
    if (name) emitEvent(EVENTS.PLAYER_RENAME, { name });
  });

  subscribe<Room[]>(EVENTS.ROOMS_LIST, (rooms: Room[]): void => {
    // TODO: make a better comparison
    const roomsHaveChanged: boolean =
      JSON.stringify(state.rooms) !== JSON.stringify(rooms);
    if (!roomsHaveChanged) return;
    state.rooms = rooms;
    state.currentRoom =
      rooms.find(
        (r: Room): boolean => !!r.players.find(p => p.id === getSocketId())
      ) || null;

    const { path } = parseHash();
    if (path === PATHS.GAME_BOARD) {
      // If we're already on the game board, just update it instead of re-rendering the dashboard
      renderGameBoard(app);
      return;
    }
    renderRooms();
    renderCurrentRoomSection();
  });

  subscribe(EVENTS.ROOM_CLOSE, (): void => {
    state.currentRoom = null;
  });

  subscribe<{ room: Room }>(
    EVENTS.GAME_STARTED,
    ({ room }: { room: Room }): void => {
      state.currentRoom = room;
      navTo(PATHS.GAME_BOARD + `?roomId=${room.id}`);
    }
  );

  subscribe<{ room: Room }>(
    EVENTS.GAME_UPDATE,
    ({ room }: { room: Room }): void => {
      state.currentRoom = room;
      renderGameBoard(app);
    }
  );

  subscribe<{ type: NOTIFICATION_TYPES; data: string }>(
    EVENTS.NOTIFICATION,
    ({ type, data }): void => {
      const name = localStorage.getItem(LOCAL_STORAGE_KEY.USERNAME);
      const isCurrentUser = name === data;

      if (!isCurrentUser) {
        switch (type) {
          case NOTIFICATION_TYPES.PLAYER_JOINED:
            Snackbar.displayMsg(
              getLanguageConfig().notifications.playerJoined(data)
            );
            break;
          case NOTIFICATION_TYPES.PLAYER_LEFT:
            Snackbar.displayMsg(
              getLanguageConfig().notifications.playerLeft(data)
            );
            break;
          case NOTIFICATION_TYPES.CLOSE_ROOM:
            Snackbar.displayMsg(
              getLanguageConfig().notifications.roomClosed(data)
            );
            break;
          case NOTIFICATION_TYPES.GAME_FINISHED:
            Snackbar.displayMsg(
              getLanguageConfig().notifications.gameFinished(data)
            );
            break;
          default:
            console.warn('Unknown notification type:', type);
        }
      } else if (type === NOTIFICATION_TYPES.GAME_FINISHED) {
        WinningAnimation.play();
      }
    }
  );
}

const app: HTMLDivElement = document.getElementById('app')! as HTMLDivElement;

setupSocket();

function clearPage(): void {
  app.innerHTML = '';
}

function router(): void {
  clearPage();
  const { path } = parseHash();
  switch (path) {
    case PATHS.DASHBOARD:
      renderDashboard(app);
      break;
    case PATHS.GAME_BOARD:
      renderGameBoard(app);
      break;
    default:
      renderDashboard(app);
  }
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
setupUnloadWarning();
