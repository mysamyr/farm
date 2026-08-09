export interface FarmTradeTranslation {
  buttonLabel: string;
  modalTitle: string;
  youGive: string;
  youReceive: string;
  lock: string;
  confirm: string;
  cancel: string;
  waitingForOpponent: string;
  opponentLocked: string;
  bothLocked: string;
}

export interface FarmTranslation {
  name: string;
  roomLeaveConfirmation: string;
  exchangeAnimalsHeader: string;
  winner: string;
  yourTurn: string;
  gameButton: {
    throwDice: string;
  };
  trade: FarmTradeTranslation;
}

export interface FarmHelpTranslation {
  title: string;
  goal: string;
  componentsHeader: string;
  components: string[];
  turnHeader: string;
  turnParagraphs: string[];
  breedingHeader: string;
  breedingParagraphs: string[];
  examplesHeader: string;
  examples: string[];
  predatorsHeader: string;
  predators: string[];
  protectionHeader: string;
  protection: string[];
  rulesHeader: string;
  rules: string[];
}
