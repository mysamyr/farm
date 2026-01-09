import type { GAME_RULES } from '../constants';
import type { LanguageCode } from '../constants/language';

export type Language = {
  name: string;
  code: LanguageCode;
};

export type Translation = {
  dashboard: {
    header: string;
    usernameInputLabel: string;
    usernameInputPlaceholder: string;
    createRoomBtn: string;
    openRoomsHeader: string;
    currentRoomHeader: string;
    noActiveRooms: string;
    noCurrentRoom: string;
    roomName: string;
    roomRules: string;
    players: string;
    errors: {
      cannotJoin: string;
      cannotStart: string;
      noRoomName: string;
    };
    rules: {
      [GAME_RULES.EXTRA_DUCK]: string;
      [GAME_RULES.ONE_EXCHANGE]: string;
    };
  };
  gameboard: {
    room: string;
    roomLeaveConfirmation: string;
    exchangeAnimalsHeader: string;
    winner: string;
    yourTurn: string;
    gameButton: {
      throwDice: string;
    };
  };
  roomButton: {
    full: string;
    join: string;
    joined: string;
    startGame: string;
    closeRoom: string;
    leaveRoom: string;
  };
  you: string;
  owner: string;
};
