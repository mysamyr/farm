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
        noUserNameOnCreateRoom:
          'Please enter your name before creating a room.',
        alreadyInRoom: 'You are already in a room.',
        apiErrorOnCreatingRoom: 'Error creating room: ',
      },
      rules: {
        [GAME_RULES.EXTRA_DUCK]: 'Extra duck on start',
        [GAME_RULES.ONE_EXCHANGE]: 'One exchange per turn',
        [GAME_RULES.UNLIMITED_CARDS]: 'Unlimited cards',
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
    roomState: {
      idle: 'Idle',
      running: 'Running',
      finished: 'Finished',
    },
    you: 'You',
    owner: 'Owner',
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
        noUserNameOnCreateRoom: 'Введіть ваше імʼя перед створенням кімнати.',
        alreadyInRoom: 'Ви вже в кімнаті.',
        apiErrorOnCreatingRoom: 'Помилка при створенні кімнати: ',
      },
      rules: {
        [GAME_RULES.EXTRA_DUCK]: 'Додаткова качка на старті',
        [GAME_RULES.ONE_EXCHANGE]: 'Один обмін за хід',
        [GAME_RULES.UNLIMITED_CARDS]: 'Безкінечна кількість карт',
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
    roomState: {
      idle: 'В очікуванні',
      running: 'В процесі',
      finished: 'Завершена',
    },
    you: 'Ви',
    owner: 'Власник',
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
  },
};

export default translations;
