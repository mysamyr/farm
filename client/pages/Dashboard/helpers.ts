import {
  Button,
  Div,
  Header,
  Input,
  Label,
  ListItem,
  Slider,
  Span,
  UList,
} from '../../components';
import {
  DEFAULT_CONFIG,
  EVENTS,
  GAME_RULES,
  ROOM_STATES,
  SELECTORS,
} from '../../constants';
import { getLanguageConfig } from '../../features/language';
import Snackbar from '../../features/snackbar';
import { emitEvent, getSocketId } from '../../socket/client';
import { state } from '../../state/store';

import type { Room, Rules } from '../../types';

function getRoomStateLabel(room: Room): HTMLSpanElement {
  return Span({
    className: ['badge', 'badge-state', room.state],
    text: getLanguageConfig().roomState[room.state],
  });
}

export function getOwnerName(room: Room): string {
  const owner = room.players.find(p => p.id === room.ownerId);
  return owner ? owner.name : 'Unknown';
}

export function getRuleLabel(key: keyof Rules): string {
  switch (key) {
    case GAME_RULES.EXTRA_DUCK:
      return getLanguageConfig().dashboard.rules[GAME_RULES.EXTRA_DUCK];
    case GAME_RULES.ONE_EXCHANGE:
      return getLanguageConfig().dashboard.rules[GAME_RULES.ONE_EXCHANGE];
    case GAME_RULES.UNLIMITED_CARDS:
      return getLanguageConfig().dashboard.rules[GAME_RULES.UNLIMITED_CARDS];
    default:
      return key;
  }
}

export function getRoomCard(room: Room): HTMLDivElement {
  const userNameInput = document.getElementById(
    SELECTORS.inputs.userName
  ) as HTMLInputElement;

  const isOwner: boolean = room.ownerId === getSocketId();
  const ownerLabel: string = isOwner
    ? getLanguageConfig().you
    : getOwnerName(room);
  const isFull: boolean = room.players.length >= 4;
  const isInRoom: boolean = room.players.some(p => p.id === getSocketId());
  const isAlreadyInRoom: boolean = !!state.currentRoom;
  const userName = userNameInput.value.trim() || '';
  const canJoinState = room.state === ROOM_STATES.IDLE;
  const canJoinName = !!userName;

  const isBtnDisabled: boolean =
    isAlreadyInRoom ||
    isFull ||
    isOwner ||
    isInRoom ||
    !canJoinState ||
    !canJoinName;

  const joinBtnTitle: string = isBtnDisabled
    ? isAlreadyInRoom
      ? getLanguageConfig().dashboard.errors.alreadyInRoom
      : isFull
        ? getLanguageConfig().roomButton.full
        : isOwner
          ? getLanguageConfig().you + ' ' + getLanguageConfig().owner
          : isInRoom
            ? getLanguageConfig().roomButton.joined
            : !canJoinState
              ? getLanguageConfig().dashboard.errors.cannotJoin
              : !canJoinName
                ? getLanguageConfig().dashboard.errors.noUserNameOnCreateRoom
                : ''
    : '';

  return Div({
    className: 'room-card',
    children: [
      Div({
        className: 'room-details',
        children: [
          Header(3, { text: room.name }),
          Div({
            className: 'room-meta',
            children: [
              Span({
                className: ['badge', 'badge-owner'],
                text: `${getLanguageConfig().owner}: ${ownerLabel}`,
              }),
              getRoomStateLabel(room),
              Span({
                className: 'player-count',
                text: `👥 ${room.players.length}/4`,
              }),
            ],
          }),
          Div({
            className: 'rules-tags',
            children: Object.values(GAME_RULES)
              .filter(ruleKey => room.rules[ruleKey])
              .map(ruleKey =>
                Span({
                  className: 'rule-tag',
                  text: getRuleLabel(ruleKey),
                })
              ),
          }),
        ],
      }),
      Button({
        className: ['btn', isBtnDisabled ? 'btn-secondary' : 'btn-primary'],
        disabled: isBtnDisabled,
        text: isFull
          ? getLanguageConfig().roomButton.full
          : isInRoom
            ? getLanguageConfig().roomButton.joined
            : getLanguageConfig().roomButton.join,
        title: joinBtnTitle,
        onClick: (): void => {
          if (isBtnDisabled) {
            Snackbar.displayMsg(
              getLanguageConfig().dashboard.errors.cannotJoin
            );
            return;
          }
          emitEvent(
            EVENTS.ROOM_JOIN,
            { roomId: room.id },
            (res: { ok: boolean; error?: string }): void => {
              if (!userName) {
                userNameInput.classList.add('input-error');
                userNameInput.focus();
                return;
              }
              if (!res.ok) {
                Snackbar.displayMsg(res.error as string);
              }
            }
          );
        },
      }),
    ],
  });
}

export function getRoomHeader(room: Room): HTMLDivElement {
  const isOwner: boolean = room.ownerId === getSocketId();

  const LabelComponent = isOwner ? Label : Span;

  const roomName = isOwner
    ? Input({
        className: 'room-name-input',
        value: room.name,
        type: 'text',
        onChange: (e: Event): void => {
          const input = e.target as HTMLInputElement;
          const name = input.value.trim();
          if (!name) {
            input.value = room.name;
            Snackbar.displayMsg(
              getLanguageConfig().dashboard.errors.noRoomName
            );
            return;
          }
          if (name === room.name) return;
          input.classList.remove('input-error');
          emitEvent(
            EVENTS.ROOM_UPDATE,
            { roomId: room.id, name },
            (res: { ok: boolean; error?: string }): void => {
              if (!res.ok) {
                Snackbar.displayMsg(res.error as string);
              }
            }
          );
        },
      })
    : Header(3, { text: room.name });

  return Div({
    children: [
      LabelComponent({
        className: 'group-header-label',
        text: getLanguageConfig().dashboard.roomName,
      }),
      roomName,
    ],
  });
}

export function getPlayersList(room: Room): HTMLDivElement {
  const playersItems = room.players.map(player => {
    const badges = [];
    if (player.id === getSocketId()) {
      badges.push(
        Span({
          className: ['badge', 'badge-me'],
          text: getLanguageConfig().you,
        })
      );
    }
    if (player.id === room.ownerId) {
      badges.push(
        Span({
          className: ['badge', 'badge-owner'],
          text: getLanguageConfig().owner,
        })
      );
    }
    return ListItem({
      className: 'player-row',
      children: [Span({ className: 'p-name', text: player.name }), ...badges],
    });
  });

  return Div({
    children: [
      Header(4, {
        text: `${getLanguageConfig().dashboard.players} (${room.players.length}/4)`,
      }),
      UList({
        children: playersItems,
      }),
    ],
  });
}

export function getGameRules(room: Room): HTMLDivElement {
  const isOwner: boolean = room.ownerId === getSocketId();

  const rulesItems = Object.values(GAME_RULES)
    .map(
      (ruleKey: GAME_RULES): HTMLDivElement | HTMLSpanElement | undefined => {
        if (isOwner) {
          return Slider({
            label: getRuleLabel(ruleKey),
            checked: room.rules[ruleKey],
            onChange: (e: Event): void => {
              emitEvent(
                EVENTS.ROOM_UPDATE,
                {
                  roomId: room.id,
                  rules: {
                    [ruleKey]: (e.target as HTMLInputElement).checked,
                  },
                },
                (res: { ok: boolean; error: string }): void => {
                  if (!res.ok) {
                    Snackbar.displayMsg(res.error as string);
                  }
                }
              );
            },
          });
        }
        if (room.rules[ruleKey]) {
          return Span({
            className: 'rule-tag',
            text: getRuleLabel(ruleKey),
          });
        }
      }
    )
    .filter(Boolean) as HTMLElement[];

  return Div({
    className: 'rules-config',
    children: [
      Header(4, { text: getLanguageConfig().dashboard.roomRules }),
      Div({
        className: isOwner ? 'rule-toggles' : 'rules-tags',
        children: rulesItems,
      }),
    ],
  });
}

export function getActionsPanel(room: Room): HTMLDivElement {
  const isOwner: boolean = room.ownerId === getSocketId();
  const playerCount = room.players.length;
  const canStartGame =
    isOwner &&
    playerCount >= DEFAULT_CONFIG.minPlayers &&
    playerCount <= DEFAULT_CONFIG.maxPlayers &&
    room.state === ROOM_STATES.IDLE;

  const actions = isOwner
    ? [
        Button({
          className: ['btn', 'btn-success', 'full-width'],
          text: getLanguageConfig().roomButton.startGame,
          disabled: !canStartGame,
          onClick: (): void => {
            if (!canStartGame) {
              Snackbar.displayMsg(
                getLanguageConfig().dashboard.errors.cannotStart
              );
              return;
            }
            emitEvent(EVENTS.GAME_START, { roomId: room.id });
          },
        }),
        Button({
          className: ['btn', 'btn-danger-outline', 'full-width'],
          text: getLanguageConfig().roomButton.closeRoom,
          onClick: (): void => {
            emitEvent(EVENTS.ROOM_CLOSE, {
              roomId: room.id,
            });
          },
        }),
      ]
    : [
        Button({
          className: ['btn', 'btn-danger-outline', 'full-width'],
          text: getLanguageConfig().roomButton.leaveRoom,
          onClick: (): void => {
            emitEvent(EVENTS.ROOM_LEAVE, {
              roomId: room.id,
            });
          },
        }),
      ];

  return Div({
    className: 'actions-panel',
    children: actions,
  });
}
