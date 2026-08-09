import type { FarmHelpTranslation, FarmTranslation } from './types.js';

export const farmGameTranslation: FarmTranslation = {
  name: 'Super Farm',
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
    'Extra duck on start: each player begins with 1 🦆 (but 🦊 still eats ALL ducks).',
    'One exchange per turn: only 1 exchange with the main herd before rolling.',
    'Unlimited cards: no limit to animal cards (you may have more than main herd counts).',
  ],
};
