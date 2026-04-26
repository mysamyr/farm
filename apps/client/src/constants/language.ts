import { VALIDATION, ERROR } from '@game/shared/constants';
import { GAME_RULES } from '@game/shared/constants/farm';

import type { Language, Translation } from '../types/language';

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
      // Client-only validations
      userNameTooShort: `Name must be at least ${VALIDATION.USER_NAME.MIN_LENGTH} characters.`,
      userNameTooLong: `Name must be at most ${VALIDATION.USER_NAME.MAX_LENGTH} characters.`,
      cannotJoin: 'Cannot join.',
      apiErrorOnCreatingRoom: 'Error creating room: ',
    },
    dashboard: {
      header: 'Super Farm',
      usernameInputLabel: 'Your Name:',
      usernameInputPlaceholder: 'Enter nickname',
      createRoomBtn: 'Create Room',
      openRoomsHeader: 'Open Rooms',
      currentRoomHeader: 'Current Room',
      noActiveRooms: 'Create new room.',
      roomRules: 'Rules',
      players: 'Players',
      rules: {
        [GAME_RULES.EXTRA_DUCK]: 'Extra duck on start',
        [GAME_RULES.ONE_EXCHANGE]: 'One exchange per turn',
        [GAME_RULES.UNLIMITED_CARDS]: 'Unlimited cards',
      },
    },
    gameboard: {
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
    roomState: {
      idle: 'Idle',
      running: 'Running',
      finished: 'Finished',
    },
    you: 'You',
    owner: 'by',
    youWin: 'You win!',
    help: {
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
    notifications: {
      playerJoined: (name: string): string => `${name} joined the room.`,
      playerLeft: (name: string): string => `${name} left the room.`,
      roomClosed: (name: string): string => `${name} closed the room.`,
      gameFinished: (name: string): string => `Game over! Winner: ${name}`,
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
      // Client-only validations
      userNameTooShort: `Імʼя має містити щонайменше ${VALIDATION.USER_NAME.MIN_LENGTH} символи.`,
      userNameTooLong: `Імʼя має містити щонайбільше ${VALIDATION.USER_NAME.MAX_LENGTH} символів.`,
      cannotJoin: 'Неможливо приєднатися.',
      apiErrorOnCreatingRoom: 'Помилка при створенні кімнати: ',
    },
    dashboard: {
      header: 'Весела Ферма',
      usernameInputLabel: 'Ваше імʼя:',
      usernameInputPlaceholder: 'Введіть імʼя',
      createRoomBtn: 'Створити кімнату',
      openRoomsHeader: 'Відкриті кімнати',
      currentRoomHeader: 'Активна Кімната',
      noActiveRooms: 'Створіть нову кімнату.',
      roomRules: 'Правила',
      players: 'Гравців',
      rules: {
        [GAME_RULES.EXTRA_DUCK]: 'Додаткова качка на старті',
        [GAME_RULES.ONE_EXCHANGE]: 'Один обмін за хід',
        [GAME_RULES.UNLIMITED_CARDS]: 'Безкінечна кількість карт',
      },
    },
    gameboard: {
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
    roomState: {
      idle: 'В очікуванні',
      running: 'В процесі',
      finished: 'Завершена',
    },
    you: 'Ви',
    owner: 'Власник',
    youWin: 'Ви виграли!',
    help: {
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
    notifications: {
      playerJoined: (name: string): string => `${name} приєднався до кімнати.`,
      playerLeft: (name: string): string => `${name} покинув кімнату.`,
      roomClosed: (name: string): string => `${name} закрив кімнату.`,
      gameFinished: (name: string): string =>
        `Гра закінчена! Переможець: ${name}`,
    },
  },
};

export default translations;
