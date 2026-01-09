import { PATHS } from './constants';
import Snackbar from './features/snackbar';
import renderDashboard from './pages/Dashboard';
import {
  renderCurrentRoomSection,
  renderRooms,
} from './pages/Dashboard/render';
import renderGameBoard from './pages/Gameboard';
import { getSocketId, setupSocket } from './socket/client';
import { state } from './state/store';
import { navTo, parseHash } from './utils/navigation';
import { setupUnloadWarning } from './utils/unload';

import type { Player, Room } from './types';

const app: HTMLDivElement = document.getElementById('app')! as HTMLDivElement;

setupSocket({
  onRoomsList(rooms: Room[]): void {
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
      renderGameBoard(app);
      return;
    }
    renderRooms();
    renderCurrentRoomSection();
  },
  onRoomClosed(): void {
    state.currentRoom = null;
  },
  onGameStarted({ room }: { room: Room }): void {
    state.currentRoom = room;
    navTo(PATHS.GAME_BOARD + `?roomId=${room.id}`);
  },
  onGameUpdate({ room }: { room: Room }): void {
    state.currentRoom = room;
    renderGameBoard(app);
  },
  onGameFinished({ winner }: { winner: Player }): void {
    Snackbar.displayMsg(`Game over! Winner: ${winner.name}`);
  },
});

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
