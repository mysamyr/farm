import { VALIDATION, ERROR } from '@game/shared/constants';

import type { Language, Translation } from '../types/language';

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

const translations: Record<LanguageCode, Translation> = {
  [LanguageCode.EN]: {
    errors: {
      [ERROR.NO_USERNAME]: 'Please enter your name before creating a room.',
      [ERROR.NAME_TAKEN]: 'This name is already taken.',
      [ERROR.INVALID_PLAYER_NAME_LENGTH]: 'Invalid name length.',
      [ERROR.PLAYER_NOT_FOUND]: 'Player not found.',
      [ERROR.ALREADY_IN_ROOM]: 'You are already in a room.',
      [ERROR.ROOM_NOT_FOUND]: 'Room not found.',
      [ERROR.ROOM_FULL]: 'Room is full.',
      [ERROR.INVALID_ROOM_NAME]: 'Enter room name.',
      [ERROR.NOT_OWNER]: 'You are not the room owner.',
      [ERROR.CANNOT_START]: 'Cannot start the game.',
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
      apiErrorOnCreatingRoom: 'Error creating room: ',
    },
    dashboard: {
      header: 'Super Farm',
      usernameInputLabel: 'Your Name:',
      createRoomBtn: 'Create Room',
      openRoomsHeader: 'Open Rooms',
      noActiveRooms: 'Create new room.',
      roomRules: 'Rules',
      players: 'Players',
      rules: {
        extra_duck: 'Extra duck on start',
        one_exchange_per_turn: 'One exchange per turn',
        unlimited_cards: 'Unlimited cards',
        allow_player_trade: 'Allow player trade',
      },
    },
    game: {
      farm: {
        roomLeaveConfirmation: 'Are you sure you want to leave room?',
        exchangeAnimalsHeader: 'Exchange Animals',
        winner: 'WINNER',
        yourTurn: 'YOUR TURN',
        gameButton: {
          throwDice: 'Throw Dice',
        },
        trade: {
          buttonLabel: 'Trade',
          modalTitle: 'Trade with',
          youGive: 'You give',
          youReceive: 'You receive',
          lock: 'Lock Offer',
          confirm: 'Confirm',
          cancel: 'Cancel',
          waitingForOpponent: 'Waiting for opponent to lock...',
          opponentLocked: 'Opponent locked their offer!',
          bothLocked: 'Locked — confirm to trade!',
        },
      },
    },
    help: {
      farm: {
        title: 'Game Goal',
        goal: 'Be the first to collect 1 animal of each species on your farm: Duck 🦆, Goat 🐐, Pig 🐖, Horse 🐎, Cow 🐄',
        componentsHeader: 'Components',
        components: [
          'Dice: 2 pcs',
          'Faces: 🦆, 🐐, 🐖, 🐎 / 🐄, 🦊 / 🐻.',
          'Main herd: 60 🦆, 24 🐐, 20 🐖, 12 🐎, 8 🐄.',
          'Dogs: 4 🐕 (protects from 🦊), 2 🐕‍🦺 (protects from 🐻)',
        ],
        turnHeader: "Player's Turn",
        turnParagraphs: [
          '(Optional) make 1 or several exchanges with the main herd (according to rules) before rolling.',
          'Throw 2 dice',
          'Apply results (predators / breeding)',
        ],
        breedingHeader: 'Breeding of animals',
        breedingParagraphs: [
          'Only animals shown on the dice breed.',
          'To breed you need a pair of the same species.',
          'You receive 1 new animal from the main herd for each full pair.',
        ],
        examplesHeader: 'Examples:',
        examples: [
          'Have 1 🦆, rolled 1 🦆 → (1+1)/2 = +1 🦆 (1 pair)',
          'Have 3 🦆, rolled 🦆🦆 → (3+2)/2 = +2 🦆 (2 pairs)',
          'No 🐖 nor 🐎, rolled 🐖 + 🐎 → nothing, because there were no pairs',
        ],
        predatorsHeader: 'Predators',
        predators: [
          '🦊 Fox → you return all 🦆 and 🐐 to the main herd',
          '🐻 Bear → you return all 🐖 and 🐎 to the main herd',
        ],
        protectionHeader: 'Protection from predators',
        protection: [
          '🐕 Small dog → protects from 🦊',
          '🐕‍🦺 Big dog → protects from 🐻',
          'On attack only dog is returned, animals are kept',
        ],
        rulesHeader: 'Rules',
        rules: [
          'Extra duck on start: each player begins with 1 🦆 (but 🦊 still eats ALL ducks).',
          'One exchange per turn: only 1 exchange with the main herd before rolling.',
          'Unlimited cards: no limit to animal cards (you may have more than main herd counts).',
        ],
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
      [ERROR.ROOM_FULL]: 'Кімната переповнена.',
      [ERROR.INVALID_ROOM_NAME]: 'Введіть назву кімнати.',
      [ERROR.NOT_OWNER]: 'Ви не власник кімнати.',
      [ERROR.CANNOT_START]: 'Неможливо розпочати.',
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
      apiErrorOnCreatingRoom: 'Помилка при створенні кімнати: ',
    },
    dashboard: {
      header: 'Весела Ферма',
      usernameInputLabel: 'Ваше імʼя:',
      createRoomBtn: 'Створити кімнату',
      openRoomsHeader: 'Відкриті кімнати',
      noActiveRooms: 'Створіть нову кімнату.',
      roomRules: 'Правила',
      players: 'Гравців',
      rules: {
        extra_duck: 'Додаткова качка на старті',
        one_exchange_per_turn: 'Один обмін за хід',
        unlimited_cards: 'Безкінечна кількість карт',
        allow_player_trade: 'Обмін між гравцями',
      },
    },
    game: {
      farm: {
        roomLeaveConfirmation: 'Ви впевнені, що хочете залишити кімнату?',
        exchangeAnimalsHeader: 'Обмін Тваринами',
        winner: 'ПЕРЕМОЖЕЦЬ',
        yourTurn: 'ВАША ЧЕРГА',
        gameButton: {
          throwDice: 'Кинути Кубики',
        },
        trade: {
          buttonLabel: 'Обмін',
          modalTitle: 'Обмін з',
          youGive: 'Ви віддаєте',
          youReceive: 'Ви отримуєте',
          lock: 'Зафіксувати',
          confirm: 'Підтвердити',
          cancel: 'Скасувати',
          waitingForOpponent: 'Очікуємо фіксації суперника...',
          opponentLocked: 'Суперник зафіксував пропозицію!',
          bothLocked: 'Зафіксовано — підтвердіть обмін!',
        },
      },
    },
    help: {
      farm: {
        title: 'Мета гри',
        goal: 'Першим зібрати на своїй фермі по 1 тварині кожного виду: Качка 🦆, Коза 🐐, Свиня 🐖, Кінь 🐎, Корова 🐄',
        componentsHeader: 'Компоненти',
        components: [
          'Кубики: 2 шт',
          'Грані: 🦆, 🐐, 🐖, 🐎 / 🐄, 🦊 / 🐻.',
          'Головне стадо: 60 🦆, 24 🐐, 20 🐖, 12 🐎, 8 🐄.',
          'Собаки: 4 🐕(захист від 🦊), 2 🐕‍🦺(захист від 🐻)',
        ],
        turnHeader: 'Хід гравця',
        turnParagraphs: [
          '(Опціонально) зроби 1 чи кілька (згідно з правилами, описаними нижче) обмінів з головним стадом (за курсом)',
          'Кинь 2 кубики',
          'Застосуй результат (хижаки / розмноження)',
        ],
        breedingHeader: 'Розмноження тварин',
        breedingParagraphs: [
          'Розмножуються лише ті тварини, що випали на кубиках.',
          'Для розмноження потрібна пара одного виду.',
          'Отримуєш 1 нову тварину з головного стада за кожну повну пару.',
        ],
        examplesHeader: 'Приклади:',
        examples: [
          'Є 1 🦆, випала 1 🦆 → (1+1)/2 = +1 🦆 (1 пара)',
          'Є 3 🦆, випали 🦆🦆 → (3+2)/2 = +2 🦆 (2 пари)',
          'Немає ні 🐖 ні 🐎, випали 🐖 + 🐎 → нічого, бо цих тварин не було парами',
        ],
        predatorsHeader: 'Хижаки',
        predators: [
          '🦊 Лисиця → повертаєш у стадо всіх 🦆 і 🐐',
          '🐻 Ведмідь → повертаєш у стадо всіх 🐖 і 🐎',
        ],
        protectionHeader: 'Захист від хижаків',
        protection: [
          '🐕 Маленька собака → захищає від 🦊',
          '🐕‍🦺 Велика собака → захищає від 🐻',
          'При нападі віддається лише собака, тварини зберігаються',
        ],
        rulesHeader: 'Правила',
        rules: [
          'Додаткова качка на старті: кожен гравець починає з 1 🦆 (але 🦊 так чи інакше зʼїдає всіх 🦆).',
          'Один обмін за хід: перед кидком кубиків можливий лише 1 обмін з головним стадом.',
          'Безкінечна кількість карт: ліміт карт тварин не застосовується (можна мати більше 60-ти 🦆, 24-ти 🐐...).',
        ],
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
      roomClosed: (name: string): string => `${name} закрив кімнату.`,
      gameFinished: (name: string): string =>
        `Гра закінчена! Переможець: ${name}`,
      tradeCancelled: (name: string): string => `${name} скасував обмін.`,
    },
  },
};

export default translations;
