export { DEFAULT_CONFIG } from '../shared/index.js';

export {
  ANIMALS_WAGES,
  BLUE_DICE,
  FARM_ANIMALS,
  ORANGE_DICE,
  TURN_START_INDEX,
} from './constants.js';

export {
  areLimitedCards,
  checkWinner,
  getAddedAnimalsCount,
  getCurrentPlayerTurnId,
  getInitDuckValue,
  isEnoughCardsToExchange,
  isExchangeForbidden,
  isTradeAllowed,
  rollDice,
  validateTradeOffer,
} from './helpers.js';

export {
  addRoomFields,
  applyDiceResult,
  applyExchange,
  applyTrade,
  checkPlayerAction,
  initGameState,
  markWinner,
  removePlayerFromOrder,
  setNextTurn,
  updateRoomOrderId,
} from './engine.js';

export { handleAction } from './handlers.js';

export type {
  DiceAnimals,
  FarmAnimals,
  Player,
  Room,
  Rules,
  TradableAnimals,
  TradeOffer,
  TradeState,
} from '../shared/index.js';

export type { GameHandlerContext } from '@game/shared/engine';
