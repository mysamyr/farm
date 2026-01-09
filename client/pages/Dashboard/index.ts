import { Button, Div, Header, Input, Label } from '../../components';
import { EVENTS, SELECTORS } from '../../constants';
import {
  getLanguageConfig,
  renderLanguageDropdown,
} from '../../features/language';
import Snackbar from '../../features/snackbar';
import { emitEvent } from '../../socket/client';
import { state } from '../../state/store';

import { renderCurrentRoomSection, renderRooms } from './render';

export default function (app: HTMLDivElement): void {
  const userNameInput = Input({
    id: SELECTORS.inputs.userName,
    placeholder: getLanguageConfig().dashboard.usernameInputPlaceholder,
    type: 'text',
    autocomplete: 'username',
    onChange: (e: Event): void => {
      const input = e.target as HTMLInputElement;
      const name = input.value.trim();
      if (name) {
        input.classList.remove('input-error');
        emitEvent('player:rename', { name });
        renderRooms();
      }
    },
  });

  const onCreateRoom = (): void => {
    if (userNameInput.validationMessage) {
      Snackbar.displayMsg(userNameInput.validationMessage);
      userNameInput.classList.add('input-error');
      userNameInput.focus();
      return;
    }
    const name = userNameInput.value.trim();
    if (!name) {
      Snackbar.displayMsg('Please enter your name before creating a room.');
      userNameInput.classList.add('input-error');
      userNameInput.focus();
      return;
    }
    if (state.currentRoom) {
      Snackbar.displayMsg(
        'You are already in a room. Please leave your current room before creating a new one.'
      );
      return;
    }
    emitEvent(
      EVENTS.ROOM_CREATE,
      { user: name },
      (res: { ok: boolean; error?: string }): void => {
        if (!res.ok) {
          Snackbar.displayMsg('Error creating room: ' + res.error);
        }
      }
    );
  };

  app.append(
    Div({
      className: 'top-bar',
      children: [
        Div({
          className: 'brand',
          children: [
            Header(1, { text: getLanguageConfig().dashboard.header }),
            Div({
              className: 'language-select',
              text: '🌍',
              onClick: renderLanguageDropdown,
            }),
          ],
        }),
        Div({
          className: 'user-profile',
          children: [
            Div({
              className: 'input-group',
              children: [
                Label({
                  htmlFor: SELECTORS.inputs.userName,
                  text: getLanguageConfig().dashboard.usernameInputLabel,
                }),
                userNameInput,
              ],
            }),
            Button({
              className: ['btn', 'btn-primary'],
              text: getLanguageConfig().dashboard.createRoomBtn,
              onClick: onCreateRoom,
            }),
          ],
        }),
      ],
    }),
    Div({
      className: 'dashboard-grid',
      children: [
        Div({
          className: 'rooms-list-section',
          children: [
            Header(2, { text: getLanguageConfig().dashboard.openRoomsHeader }),
            Div({ className: 'room-list', id: SELECTORS.containers.roomsList }),
          ],
        }),
        Div({
          className: 'current-room-section',
          children: [
            Header(2, {
              text: getLanguageConfig().dashboard.currentRoomHeader,
            }),
            Div({
              className: 'panel-card',
              id: SELECTORS.containers.currentRoom,
            }),
          ],
        }),
      ],
    })
  );

  renderRooms();
  renderCurrentRoomSection();
}
