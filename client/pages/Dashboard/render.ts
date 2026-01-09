import { Paragraph } from '../../components';
import { SELECTORS } from '../../constants';
import { getLanguageConfig } from '../../features/language';
import { state } from '../../state/store';

import {
  getActionsPanel,
  getGameRules,
  getPlayersList,
  getRoomCard,
  getRoomHeader,
} from './helpers';

export function renderRooms(): void {
  const container = document.getElementById(SELECTORS.containers.roomsList);
  if (!container) return;
  container.innerHTML = '';

  if (!state.rooms.length) {
    container.appendChild(
      Paragraph({ text: getLanguageConfig().dashboard.noActiveRooms })
    );
    return;
  }

  const rooms: HTMLDivElement[] = state.rooms.map(getRoomCard);

  container.append(...rooms);
}

export function renderCurrentRoomSection(): void {
  const container = document.getElementById(SELECTORS.containers.currentRoom);
  if (!container) return;
  container.innerHTML = '';
  const room = state.currentRoom;
  if (!room) {
    container.appendChild(
      Paragraph({ text: getLanguageConfig().dashboard.noCurrentRoom })
    );
    return;
  }

  container.append(
    getRoomHeader(room),
    getPlayersList(room),
    getGameRules(room),
    getActionsPanel(room)
  );
}
