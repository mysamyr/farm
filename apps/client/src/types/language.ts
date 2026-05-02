import type { ERROR } from '@game/shared/constants';
import type { GameId } from '@game/shared/types';

import type { LanguageCode } from '../constants/language';

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

export type Translation = {
  errors: ErrorMessages;
  dashboard: {
    header: string;
    usernameInputLabel: string;
    createRoomBtn: string;
    openRoomsHeader: string;
    noActiveRooms: string;
    roomRules: string;
    players: string;
    rules: Record<string, string>;
  };
  game: {
    [K in GameId]: Record<string, unknown>;
  };
  help: {
    [K in GameId]: Record<string, string | string[]>;
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
