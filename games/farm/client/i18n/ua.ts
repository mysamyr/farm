import { GAME_RULES } from '../../shared/index.js';

import type { FarmHelpTranslation, FarmTranslation } from './types.js';

export const farmGameTranslation: FarmTranslation = {
  name: 'Весела Ферма',
  shortDescription:
    'Збирай тварин, уникай хижаків і першим заповни свою ферму.',
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
  ruleLabels: {
    [GAME_RULES.EXTRA_DUCK]: 'Додаткова качка на старті',
    [GAME_RULES.ONE_EXCHANGE]: 'Один обмін за хід',
    [GAME_RULES.UNLIMITED_CARDS]: 'Безкінечна кількість карт',
    [GAME_RULES.ALLOW_PLAYER_TRADE]: 'Обмін між гравцями',
  },
};

export const farmHelpTranslation: FarmHelpTranslation = {
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
    {
      ruleName: GAME_RULES.EXTRA_DUCK,
      description:
        'Кожен гравець починає з 1 🦆 (але 🦊 так чи інакше зʼїдає всіх 🦆).',
    },
    {
      ruleName: GAME_RULES.ONE_EXCHANGE,
      description:
        'Перед кидком кубиків можливий лише 1 обмін з головним стадом.',
    },
    {
      ruleName: GAME_RULES.UNLIMITED_CARDS,
      description:
        'Ліміт карт тварин не застосовується (можна мати більше 60-ти 🦆, 24-ти 🐐...).',
    },
    {
      ruleName: GAME_RULES.ALLOW_PLAYER_TRADE,
      description: 'Гравці можуть обмінюватися тваринами між собою.',
    },
  ],
};
