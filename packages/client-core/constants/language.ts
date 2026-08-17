import { ERROR, VALIDATION } from '@game/shared/constants';

import type { Language, Translation } from '../types/language.js';

export enum LanguageCode {
  EN = 'en',
  UA = 'ua',
}

export const DEFAULT_LANGUAGE = LanguageCode.EN;

export const LANGUAGES_CONFIG: Language[] = [
  {
    name: 'English',
    code: LanguageCode.EN,
  },
  {
    name: 'Українська',
    code: LanguageCode.UA,
  },
];

/**
 * Core translations for the game-agnostic client shell.
 * Game-specific translations are managed by each game plugin.
 */
const translations: Record<LanguageCode, Translation> = {
  [LanguageCode.EN]: {
    errors: {
      [ERROR.NO_USERNAME]: 'Please enter your name before creating a room.',
      [ERROR.NAME_TAKEN]: 'This name is already taken.',
      [ERROR.INVALID_PLAYER_NAME_LENGTH]: 'Invalid name length.',
      [ERROR.PLAYER_NOT_FOUND]: 'Player not found.',
      [ERROR.ALREADY_IN_ROOM]: 'You are already in a room.',
      [ERROR.ROOM_NOT_FOUND]: 'Room not found.',
      [ERROR.GAME_NOT_FOUND]: 'Game not found.',
      [ERROR.ROOM_FULL]: 'Room is full.',
      [ERROR.INVALID_ROOM_NAME]: 'Enter room name.',
      [ERROR.NOT_OWNER]: 'You are not the room owner.',
      [ERROR.CANNOT_START]: 'Cannot start the game.',
      [ERROR.CANNOT_KICK]: 'Cannot kick this player.',
      [ERROR.PLAYER_KICKED]: 'You have been kicked from this room.',
      [ERROR.GAME_IN_PROGRESS]: 'Cannot join. Game is in progress.',
      [ERROR.GAME_NOT_RUNNING]: 'Game is not running.',
      [ERROR.NOT_YOUR_TURN]: 'It is not your turn.',
      [ERROR.EXCHANGE_IS_FORBIDDEN]: 'Exchange is not allowed.',
      [ERROR.NOT_ENOUGH_CARDS]: 'Not enough cards for this exchange.',
      [ERROR.LIMITED_CARDS_EXCEEDED]: 'Card limit exceeded.',
      [ERROR.UNKNOWN_EMOTE]: 'Unknown emote.',
      [ERROR.THROTTLED]: 'Too many requests. Please try again later.',
      [ERROR.TRADE_NOT_ALLOWED]: 'Player trade is not allowed.',
      [ERROR.TRADE_ALREADY_ACTIVE]: 'A trade is already in progress.',
      [ERROR.TRADE_NOT_ACTIVE]: 'No active trade.',
      [ERROR.TRADE_NOT_LOCKED]: 'Both players must lock their offers first.',
      [ERROR.INVALID_TRADE_TARGET]: 'Invalid trade target.',
      // Client-only validations
      userNameTooShort: `Name must be at least ${VALIDATION.USER_NAME.MIN_LENGTH} characters.`,
      userNameTooLong: `Name must be at most ${VALIDATION.USER_NAME.MAX_LENGTH} characters.`,
      cannotJoin: 'Cannot join.',
      cannotJoinKicked: 'You have been kicked from this room.',
      apiErrorOnCreatingRoom: 'Error creating room: ',
    },
    dashboard: {
      usernameInputLabel: 'Your Name:',
      createRoomBtn: 'Create Room',
      openRoomsHeader: 'Open Rooms',
      noActiveRooms: 'Create new room.',
      roomRules: 'Rules',
      players: 'Players',
    },
    roomButton: {
      full: 'Full',
      join: 'Join',
      joined: 'Joined',
      enter: 'Enter',
      startGame: 'Start Game',
      closeRoom: 'Close Room',
      leaveRoom: 'Leave Room',
      kick: 'Kick',
    },
    kick: {
      confirmTitle: 'Kick player',
      confirmMessage: (name: string): string =>
        `Are you sure you want to kick ${name}? They will not be able to rejoin this room.`,
      confirmButton: 'Kick',
      cancelButton: 'Cancel',
    },
    roomState: {
      idle: 'Idle',
      running: 'Running',
      finished: 'Finished',
    },
    you: 'You',
    owner: 'by',
    youWin: 'You win!',
    notifications: {
      playerJoined: (name: string): string => `${name} joined the room.`,
      playerLeft: (name: string): string => `${name} left the room.`,
      playerKicked: (name: string): string => `${name} has been kicked.`,
      youWereKicked: 'You have been kicked from the room.',
      roomClosed: (name: string): string => `${name} closed the room.`,
      gameFinished: (name: string): string => `Game over! Winner: ${name}`,
      tradeCancelled: (name: string): string => `${name} cancelled the trade.`,
    },
  },
  [LanguageCode.UA]: {
    errors: {
      [ERROR.NO_USERNAME]: 'Введіть ваше імʼя перед створенням кімнати.',
      [ERROR.NAME_TAKEN]: "Це ім'я вже зайняте.",
      [ERROR.INVALID_PLAYER_NAME_LENGTH]: 'Невірна довжина імені.',
      [ERROR.PLAYER_NOT_FOUND]: 'Гравця не знайдено.',
      [ERROR.ALREADY_IN_ROOM]: 'Ви вже в кімнаті.',
      [ERROR.ROOM_NOT_FOUND]: 'Кімнату не знайдено.',
      [ERROR.GAME_NOT_FOUND]: 'Гру не знайдено.',
      [ERROR.ROOM_FULL]: 'Кімната переповнена.',
      [ERROR.INVALID_ROOM_NAME]: 'Введіть назву кімнати.',
      [ERROR.NOT_OWNER]: 'Ви не власник кімнати.',
      [ERROR.CANNOT_START]: 'Неможливо розпочати.',
      [ERROR.CANNOT_KICK]: 'Неможливо вигнати цього гравця.',
      [ERROR.PLAYER_KICKED]: 'Вас вигнали з цієї кімнати.',
      [ERROR.GAME_IN_PROGRESS]: 'Неможливо приєднатися. Гра в процесі.',
      [ERROR.GAME_NOT_RUNNING]: 'Гра не запущена.',
      [ERROR.NOT_YOUR_TURN]: 'Це не ваша черга.',
      [ERROR.EXCHANGE_IS_FORBIDDEN]: 'Обмін не дозволений.',
      [ERROR.NOT_ENOUGH_CARDS]: 'Недостатньо карт для цього обміну.',
      [ERROR.LIMITED_CARDS_EXCEEDED]: 'Ліміт карт перевищений.',
      [ERROR.UNKNOWN_EMOTE]: 'Невідомий емодзі.',
      [ERROR.THROTTLED]: 'Занадто багато запитів. Спробуйте пізніше.',
      [ERROR.TRADE_NOT_ALLOWED]: 'Обмін між гравцями не дозволений.',
      [ERROR.TRADE_ALREADY_ACTIVE]: 'Обмін вже в процесі.',
      [ERROR.TRADE_NOT_ACTIVE]: 'Немає активного обміну.',
      [ERROR.TRADE_NOT_LOCKED]: 'Обидва гравці повинні зафіксувати пропозицію.',
      [ERROR.INVALID_TRADE_TARGET]: 'Невірний гравець для обміну.',
      // Client-only validations
      userNameTooShort: `Імʼя має містити щонайменше ${VALIDATION.USER_NAME.MIN_LENGTH} символи.`,
      userNameTooLong: `Імʼя має містити щонайбільше ${VALIDATION.USER_NAME.MAX_LENGTH} символів.`,
      cannotJoin: 'Неможливо приєднатися.',
      cannotJoinKicked: 'Вас вигнали з цієї кімнати.',
      apiErrorOnCreatingRoom: 'Помилка при створенні кімнати: ',
    },
    dashboard: {
      usernameInputLabel: 'Ваше імʼя:',
      createRoomBtn: 'Створити кімнату',
      openRoomsHeader: 'Відкриті кімнати',
      noActiveRooms: 'Створіть нову кімнату.',
      roomRules: 'Правила',
      players: 'Гравців',
    },
    roomButton: {
      full: 'Повна',
      join: 'Приєднатися',
      joined: 'Приєднано',
      enter: 'Увійти',
      startGame: 'Розпочати Гру',
      closeRoom: 'Закрити Кімнату',
      leaveRoom: 'Залишити Кімнату',
      kick: 'Вигнати',
    },
    kick: {
      confirmTitle: 'Вигнати гравця',
      confirmMessage: (name: string): string =>
        `Ви впевнені, що хочете вигнати ${name}? Вони не зможуть повернутися до цієї кімнати.`,
      confirmButton: 'Вигнати',
      cancelButton: 'Скасувати',
    },
    roomState: {
      idle: 'В очікуванні',
      running: 'В процесі',
      finished: 'Завершена',
    },
    you: 'Ви',
    owner: 'Власник',
    youWin: 'Ви виграли!',
    notifications: {
      playerJoined: (name: string): string => `${name} приєднався до кімнати.`,
      playerLeft: (name: string): string => `${name} покинув кімнату.`,
      playerKicked: (name: string): string => `${name} був вигнаний.`,
      youWereKicked: 'Вас вигнали з кімнати.',
      roomClosed: (name: string): string => `${name} закрив кімнату.`,
      gameFinished: (name: string): string =>
        `Гра закінчена! Переможець: ${name}`,
      tradeCancelled: (name: string): string => `${name} скасував обмін.`,
    },
  },
};

export default translations;
