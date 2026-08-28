import type { ERROR } from '@game/shared/constants';

import type { LanguageCode } from '../constants/index.js';

export type Language = {
  name: string;
  code: LanguageCode;
};

type ClientErrorKeys = {
  cannotJoin: string;
  cannotJoinKicked: string;
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
  catalog: {
    title: string;
    roomsCount: (count: number) => string;
    playersRange: (min: number, max: number) => string;
    empty: string;
  };
  siteRules: {
    title: string;
    intro: string;
    sections: Array<{ heading: string; body: string }>;
  };
  changeName: {
    title: string;
    description: string;
    placeholder: string;
    save: string;
    cancel: string;
  };
  header: {
    setName: string;
    leaveRoomConfirmation: string;
    changeLanguage: string;
    toggleTheme: string;
    showRules: string;
    openMenu: string;
    language: string;
    darkMode: string;
    lightMode: string;
    rules: string;
    online: (count: number) => string;
  };
  statistics: {
    title: string;
    navigationLabel: string;
    selectGame: string;
    recentMatches: string;
    noMatches: string;
    win: string;
    loss: string;
    players: (count: number) => string;
    duration: (ms: number) => string;
    reset: string;
    resetConfirmTitle: string;
    resetConfirmMessage: string;
    resetConfirm: string;
    cancel: string;
    lastMatch: string;
  };
  dashboard: {
    backToGames: string;
    createRoomBtn: string;
    openRoomsHeader: string;
    noActiveRooms: string;
    createRoom: string;
    roomRules: string;
    players: string;
  };
  roomButton: {
    full: string;
    join: string;
    joined: string;
    enter: string;
    startGame: string;
    closeRoom: string;
    leaveRoom: string;
    kick: string;
  };
  kick: {
    confirmTitle: string;
    confirmMessage: (playerName: string) => string;
    confirmButton: string;
    cancelButton: string;
  };
  you: string;
  owner: string;
  youWin: string;
  postGame: {
    title: string;
    winner: (winnerName: string) => string;
    rematch: string;
    lobby: string;
    decline: string;
    leave: string;
    minimize: string;
    expand: string;
    ready: string;
    waiting: string;
    seconds: (count: number) => string;
  };
  roomState: {
    idle: string;
    running: string;
    finished: string;
  };
  notifications: {
    playerJoined: (playerName: string) => string;
    playerLeft: (playerName: string) => string;
    playerKicked: (playerName: string) => string;
    youWereKicked: string;
    roomClosed: (playerName: string) => string;
    gameFinished: (winnerName: string) => string;
    tradeCancelled: (playerName: string) => string;
    returnedToLobby: (playerName: string) => string;
  };
  inGame: {
    lobby: string;
    lobbyConfirmTitle: string;
    lobbyConfirmMessage: string;
    lobbyConfirmButton: string;
    cancel: string;
    voteTitle: string;
    readyTitle: string;
  };
};
