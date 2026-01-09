import { Button, Div, Header, Span } from '../../components';
import { EVENTS, PATHS, ROOM_STATES } from '../../constants';
import { getLanguageConfig } from '../../features/language';
import Snackbar from '../../features/snackbar';
import { emitEvent, getSocketId } from '../../socket/client';
import { state } from '../../state/store';
import { navTo } from '../../utils/navigation';

import {
  getCurrentPlayerTurnId,
  getDiceIcon,
  getPlayerCard,
  isWildAnimal,
} from './helpers';
import { renderExchangeGrid } from './render';

import type { DiceAnimals } from '../../types';

export default function (app: HTMLDivElement): void {
  app.innerHTML = '';

  const room = state.currentRoom;
  if (!room) {
    navTo(PATHS.DASHBOARD);
    return;
  }

  const currentPlayerId = getCurrentPlayerTurnId(room);
  const isYourTurn: boolean =
    room.state === ROOM_STATES.RUNNING &&
    !!currentPlayerId &&
    currentPlayerId === getSocketId();

  app.append(
    Div({
      className: 'game-header',
      children: [
        Div({
          className: 'room-info',
          children: [
            Header(1, {
              children: [
                Span({ text: `${getLanguageConfig().gameboard.room}: ` }),
                Span({ text: room.name }),
              ],
            }),
          ],
        }),
        Button({
          className: ['btn', 'btn-secondary'],
          text: getLanguageConfig().roomButton.leaveRoom,
          onClick: (): void => {
            if (
              room.state !== ROOM_STATES.RUNNING ||
              confirm(getLanguageConfig().gameboard.roomLeaveConfirmation)
            ) {
              emitEvent(
                EVENTS.ROOM_LEAVE,
                { roomId: room.id },
                (res: { ok: boolean; error?: string }): void => {
                  if (!res.ok) {
                    Snackbar.displayMsg(res.error as string);
                  }
                  state.currentRoom = null;
                  navTo(PATHS.DASHBOARD);
                }
              );
            }
          },
        }),
      ],
    }),
    Div({
      className: 'dice-section',
      children: [
        Div({
          className: 'dice-container',
          children: [
            Div({
              className: `dice ${isWildAnimal(room.dice?.[0] as DiceAnimals) ? 'wild-animal' : ''}`,
              id: 'dice-1',
              text: getDiceIcon(room.dice?.[0]),
            }),
            Div({
              className: `dice ${isWildAnimal(room.dice?.[1] as DiceAnimals) ? 'wild-animal' : ''}`,
              id: 'dice-2',
              text: getDiceIcon(room.dice?.[1]),
            }),
          ],
        }),
        Button({
          id: 'roll-btn',
          className: ['btn', 'btn-primary'],
          text: getLanguageConfig().gameboard.gameButton.throwDice,
          disabled: !isYourTurn,
          onClick: () => {
            if (!isYourTurn) return;
            emitEvent(
              EVENTS.GAME_ROLL_DICE,
              { roomId: room.id },
              (res: { ok: boolean; error?: string }): void => {
                if (!res.ok) {
                  Snackbar.displayMsg(res.error as string);
                }
              }
            );
          },
        }),
      ],
    }),
    Div({
      className: 'players-container',
      id: 'players-wrapper',
      children: room.players.map(getPlayerCard),
    }),
    Div({
      className: 'exchange-section',
      children: [
        Header(2, {
          text: getLanguageConfig().gameboard.exchangeAnimalsHeader,
        }),
        Div({ id: 'exchange-grid', className: 'exchange-grid' }),
      ],
    })
  );

  renderExchangeGrid(isYourTurn);
}
