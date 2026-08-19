import { GAME_RULES } from '../../shared/index.js';

import type { FarmHelpTranslation, FarmTranslation } from './types.js';

export const farmGameTranslation: FarmTranslation = {
  name: 'Super Farm',
  shortDescription:
    'Collect animals, dodge predators, and be the first to complete your farm.',
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
  ruleLabels: {
    [GAME_RULES.EXTRA_DUCK]: 'Extra duck on start',
    [GAME_RULES.ONE_EXCHANGE]: 'One exchange per turn',
    [GAME_RULES.UNLIMITED_CARDS]: 'Unlimited cards',
    [GAME_RULES.ALLOW_PLAYER_TRADE]: 'Allow player trade',
  },
};

export const farmHelpTranslation: FarmHelpTranslation = {
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
    {
      ruleName: GAME_RULES.EXTRA_DUCK,
      description:
        'Each player begins with 1 🦆 (but 🦊 still eats ALL ducks).',
    },
    {
      ruleName: GAME_RULES.ONE_EXCHANGE,
      description: 'Only 1 exchange with the main herd before rolling.',
    },
    {
      ruleName: GAME_RULES.UNLIMITED_CARDS,
      description:
        'No limit to animal cards (you may have more than main herd counts).',
    },
    {
      ruleName: GAME_RULES.ALLOW_PLAYER_TRADE,
      description: 'Players can trade animals with each other.',
    },
  ],
};
