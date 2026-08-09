// Farm Game - Server Module Entry Point
export { DEFAULT_CONFIG } from '../shared';

// Server constants
export {
  ANIMALS_WAGES,
  BLUE_DICE,
  FARM_ANIMALS,
  ORANGE_DICE,
  TURN_START_INDEX,
} from './constants';

// Helper functions
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
} from './helpers';

// Game engine logic
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
} from './engine';

// Socket handlers
export { registerHandlers } from './handlers';

// Re-export shared types for server use
export type {
  DiceAnimals,
  FarmAnimals,
  Player,
  Room,
  Rules,
  TradableAnimals,
  TradeOffer,
  TradeState,
} from '../shared';

// Re-export handler context type
export type { GameHandlerContext } from '@game/shared/engine';
