import { ERROR, VALIDATION } from '@game/shared/constants';

import type { Language, Translation } from '../types/language.js';

export enum LanguageCode {
  EN = 'en',
  UA = 'ua',
}

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
      [ERROR.ROOM_NAME_TAKEN]:
        'A room with this name already exists. Please try again.',
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
    catalog: {
      title: 'Choose a game',
      roomsCount: (count: number): string =>
        count === 1 ? '1 room' : `${count} rooms`,
      playersRange: (min: number, max: number): string =>
        min === max ? `${min} players` : `${min}–${max} players`,
      empty: 'No games available right now.',
    },
    siteRules: {
      title: 'Game Hub Rules',
      intro:
        'Welcome to Game Hub — a place to play together in real time. Please follow these guidelines so everyone has a fair and fun session.',
      sections: [
        {
          heading: 'Your name',
          body: 'Pick a display name that others can recognize. Keep it respectful. You can change it anytime from the header.',
        },
        {
          heading: 'How to play',
          body: 'Open a game from the catalog, then create a room or join an open one. The room owner starts the match when enough players are ready.',
        },
        {
          heading: 'Fair play',
          body: 'Do not harass other players, spam rooms, or disrupt games. Room owners may kick players who break these rules.',
        },
        {
          heading: 'Need help?',
          body: 'Each game has its own rules. Open a game and tap the help button to see how that game is played.',
        },
      ],
    },
    changeName: {
      title: 'Your name',
      description:
        'Please enter a display name. It is required to create rooms and play games with others.',
      placeholder: 'Enter your name',
      save: 'Save',
      cancel: 'Cancel',
    },
    header: {
      setName: 'Set name',
      leaveRoomConfirmation: 'Are you sure you want to leave the room?',
      changeLanguage: 'Change language',
      toggleTheme: 'Toggle theme',
      showRules: 'Show rules',
      openMenu: 'Open menu',
      language: 'Language',
      darkMode: 'Dark mode',
      lightMode: 'Light mode',
      rules: 'Rules',
      online: (count: number): string => `${count} Online`,
    },
    dashboard: {
      backToGames: 'Back to games',
      createRoomBtn: 'Create Room',
      openRoomsHeader: 'Open Rooms',
      noActiveRooms: 'No open rooms.',
      createRoom: 'Create a room to start.',
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
    postGame: {
      title: 'Game over',
      winner: (name: string): string => `Winner: ${name}`,
      rematch: 'Rematch',
      lobby: 'To lobby',
      decline: 'Decline',
      leave: 'Leave room',
      minimize: 'Minimize',
      expand: 'Expand',
      ready: 'Ready',
      waiting: 'Waiting',
      seconds: (count: number): string => `${count}s`,
    },
    notifications: {
      playerJoined: (name: string): string => `${name} joined the room.`,
      playerLeft: (name: string): string => `${name} left the room.`,
      playerKicked: (name: string): string => `${name} has been kicked.`,
      youWereKicked: 'You have been kicked from the room.',
      roomClosed: (name: string): string => `${name} closed the room.`,
      gameFinished: (name: string): string => `Game over! Winner: ${name}`,
      tradeCancelled: (name: string): string => `${name} cancelled the trade.`,
      returnedToLobby: (name: string): string =>
        `${name} ended the game and returned everyone to the lobby.`,
    },
    inGame: {
      lobby: 'Return to lobby',
      lobbyConfirmTitle: 'Return to lobby?',
      lobbyConfirmMessage:
        'This will immediately end the current game for all players and move everyone back to the lobby. No winner will be recorded.',
      lobbyConfirmButton: 'Return to lobby',
      cancel: 'Cancel',
      voteTitle: 'Rematch vote',
      readyTitle: 'Get ready',
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
      [ERROR.ROOM_NAME_TAKEN]:
        'Кімната з такою назвою вже існує. Спробуйте ще раз.',
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
    catalog: {
      title: 'Оберіть гру',
      roomsCount: (count: number): string => {
        const n = count % 10;
        const n100 = count % 100;
        if (n === 1 && n100 !== 11) return `${count} кімната`;
        if (n >= 2 && n <= 4 && (n100 < 12 || n100 > 14)) {
          return `${count} кімнати`;
        }
        return `${count} кімнат`;
      },
      playersRange: (min: number, max: number): string =>
        min === max ? `${min} гравці` : `${min}–${max} гравців`,
      empty: 'Наразі немає доступних ігор.',
    },
    siteRules: {
      title: 'Правила Game Hub',
      intro:
        'Ласкаво просимо до Game Hub — місця для спільної гри в реальному часі. Дотримуйтесь цих правил, щоб усім було комфортно.',
      sections: [
        {
          heading: 'Ваше імʼя',
          body: 'Оберіть імʼя, за яким вас можна впізнати. Будьте ввічливі. Змінити його можна будь-коли в шапці сайту.',
        },
        {
          heading: 'Як грати',
          body: 'Оберіть гру в каталозі, потім створіть кімнату або приєднайтесь до відкритої. Власник кімнати запускає гру, коли набереться достатньо гравців.',
        },
        {
          heading: 'Чесна гра',
          body: 'Не ображайте інших гравців, не спамте кімнати і не зривайте ігри. Власник кімнати може вигнати гравця, який порушує правила.',
        },
        {
          heading: 'Потрібна допомога?',
          body: 'У кожної гри свої правила. Відкрийте гру і натисніть кнопку допомоги, щоб дізнатися, як у неї грати.',
        },
      ],
    },
    changeName: {
      title: 'Ваше імʼя',
      description:
        'Будь ласка, введіть відображуване імʼя. Воно потрібне, щоб створювати кімнати та грати з іншими.',
      placeholder: 'Введіть ваше імʼя',
      save: 'Зберегти',
      cancel: 'Скасувати',
    },
    header: {
      setName: 'Вказати імʼя',
      leaveRoomConfirmation: 'Ви впевнені, що хочете залишити кімнату?',
      changeLanguage: 'Змінити мову',
      toggleTheme: 'Змінити тему',
      showRules: 'Показати правила',
      openMenu: 'Відкрити меню',
      language: 'Мова',
      darkMode: 'Темна тема',
      lightMode: 'Світла тема',
      rules: 'Правила',
      online: (count: number): string => `${count} онлайн`,
    },
    dashboard: {
      backToGames: 'Назад до ігор',
      createRoomBtn: 'Створити кімнату',
      openRoomsHeader: 'Відкриті кімнати',
      noActiveRooms: 'Немає відкритих кімнат.',
      createRoom: 'Створіть кімнату щоб розпочати.',
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
    postGame: {
      title: 'Гра завершена',
      winner: (name: string): string => `Переможець: ${name}`,
      rematch: 'Реванш',
      lobby: 'У лобі',
      decline: 'Відхилити',
      leave: 'Покинути кімнату',
      minimize: 'Згорнути',
      expand: 'Розгорнути',
      ready: 'Готовий',
      waiting: 'Очікує',
      seconds: (count: number): string => `${count}с`,
    },
    notifications: {
      playerJoined: (name: string): string => `${name} приєднався до кімнати.`,
      playerLeft: (name: string): string => `${name} покинув кімнату.`,
      playerKicked: (name: string): string => `${name} був вигнаний.`,
      youWereKicked: 'Вас вигнали з кімнати.',
      roomClosed: (name: string): string => `${name} закрив кімнату.`,
      gameFinished: (name: string): string =>
        `Гра закінчена! Переможець: ${name}`,
      tradeCancelled: (name: string): string => `${name} скасував обмін.`,
      returnedToLobby: (name: string): string =>
        `${name} завершив гру і повернув усіх у лобі.`,
    },
    inGame: {
      lobby: 'Повернутись у лобі',
      lobbyConfirmTitle: 'Повернутись у лобі?',
      lobbyConfirmMessage:
        'Це негайно завершить поточну гру для всіх гравців і поверне всіх у лобі. Переможець зараховано не буде.',
      lobbyConfirmButton: 'Повернутись у лобі',
      cancel: 'Скасувати',
      voteTitle: 'Голосування за реванш',
      readyTitle: 'Приготуйтесь',
    },
  },
};

export default translations;
