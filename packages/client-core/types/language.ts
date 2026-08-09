import type { ERROR } from '@game/shared/constants';

import type { LanguageCode } from '../constants';

export type Language = {
  name: string;
  code: LanguageCode;
};

type ClientErrorKeys = {
  cannotJoin: string;
  userNameTooShort: string;
  userNameTooLong: string;
  apiErrorOnCreatingRoom: string;
};

type ErrorMessages = ClientErrorKeys & Record<ERROR, string>;

/**
 * Core translation type for the game-agnostic client shell.
 * Game-specific translations are managed by each game plugin independently.
 */
export type Translation = {
  errors: ErrorMessages;
  dashboard: {
    usernameInputLabel: string;
    createRoomBtn: string;
    openRoomsHeader: string;
    noActiveRooms: string;
    roomRules: string;
    players: string;
    rules: Record<string, string>;
  };
  roomButton: {
    full: string;
    join: string;
    joined: string;
    enter: string;
    startGame: string;
    closeRoom: string;
    leaveRoom: string;
  };
  you: string;
  owner: string;
  youWin: string;
  roomState: {
    idle: string;
    running: string;
    finished: string;
  };
  notifications: {
    playerJoined: (playerName: string) => string;
    playerLeft: (playerName: string) => string;
    roomClosed: (playerName: string) => string;
    gameFinished: (winnerName: string) => string;
    tradeCancelled: (playerName: string) => string;
  };
};
