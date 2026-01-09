import { GAME_RULES } from '.';

import type { Language, Translation } from '../types/language';

export enum LanguageCode {
  EN = 'en',
  UK = 'uk',
}

export const LANGUAGES_CONFIG: Language[] = [
  {
    name: 'English',
    code: LanguageCode.EN,
  },
  {
    name: 'Українська',
    code: LanguageCode.UK,
  },
];

const translations: Record<LanguageCode, Translation> = {
  [LanguageCode.EN]: {
    dashboard: {
      header: 'Farm Master 🎲',
      usernameInputLabel: 'Your Name:',
      usernameInputPlaceholder: 'Enter nickname',
      createRoomBtn: 'Create Room',
      openRoomsHeader: 'Open Rooms',
      currentRoomHeader: 'Current Room',
      noActiveRooms: 'Create new room.',
      noCurrentRoom: 'Create new room or join existing.',
      roomName: 'Room Name',
      roomRules: 'Room Rules',
      players: 'Players',
      errors: {
        cannotJoin: 'Cannot join.',
        cannotStart: 'Cannot start the game.',
        noRoomName: 'Enter room name.',
      },
      rules: {
        [GAME_RULES.EXTRA_DUCK]: 'Extra duck on start',
        [GAME_RULES.ONE_EXCHANGE]: 'One exchange per turn',
      },
    },
    gameboard: {
      room: 'Room',
      roomLeaveConfirmation: 'Are you sure you want to leave room?',
      exchangeAnimalsHeader: 'Exchange Animals',
      winner: 'WINNER',
      yourTurn: 'YOUR TURN',
      gameButton: {
        throwDice: 'Throw Dice',
      },
    },
    roomButton: {
      full: 'Full',
      join: 'Join',
      joined: 'Joined',
      startGame: 'Start Game',
      closeRoom: 'Close Room',
      leaveRoom: 'Leave Room',
    },
    you: 'You',
    owner: 'Owner',
  },
  [LanguageCode.UK]: {
    dashboard: {
      header: 'Весела Ферма 🎲',
      usernameInputLabel: 'Ваше імʼя:',
      usernameInputPlaceholder: 'Введіть імʼя',
      createRoomBtn: 'Створити кімнату',
      openRoomsHeader: 'Відкриті кімнати',
      currentRoomHeader: 'Активна Кімната',
      noActiveRooms: 'Створіть нову кімнату.',
      noCurrentRoom: 'Створіть нову кімнату чи приєднайтеся до наявної.',
      roomName: 'Назва кімнати',
      roomRules: 'Правила',
      players: 'Гравців',
      errors: {
        cannotJoin: 'Неможливо приєднатися.',
        cannotStart: 'Неможливо розпочати.',
        noRoomName: 'Введіть назву кімнати.',
      },
      rules: {
        [GAME_RULES.EXTRA_DUCK]: 'Додаткова качка на старті',
        [GAME_RULES.ONE_EXCHANGE]: 'Один обмін за хід',
      },
    },
    gameboard: {
      room: 'Кімната',
      roomLeaveConfirmation: 'Ви впевнені, що хочете залишити кімнату?',
      exchangeAnimalsHeader: 'Обмін Тваринами',
      winner: 'ПЕРЕМОЖЕЦЬ',
      yourTurn: 'ВАША ЧЕРГА',
      gameButton: {
        throwDice: 'Кинути Кубики',
      },
    },
    roomButton: {
      full: 'Повна',
      join: 'Приєднатися',
      joined: 'Приєднано',
      startGame: 'Розпочати Гру',
      closeRoom: 'Закрити Кімнату',
      leaveRoom: 'Залишити Кімнату',
    },
    you: 'Ви',
    owner: 'Власник',
  },
};

export default translations;
