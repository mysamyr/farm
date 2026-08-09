// Arena Game - Server Module Entry Point
export { BASE_SKILLS, DEFAULT_CONFIG, SKILLS } from '../shared';

// Server types
export type { TurnContext } from './types';

// Server constants
export { NO_CONTEXT, TURN_START_INDEX } from './constants';

// Helper functions
export {
  calculateDamage,
  canStartArenaGame,
  getActivePlayer,
  getLeech,
  getOpponent,
  getPlayerMaxHp,
  getPlayerMinHp,
  getPlayerStats,
  getSkillById,
  getThorns,
  isDead,
  isPlayerResistant,
  isStunned,
  isValidSkillSelection,
  type PlayerStats,
  rollChance,
  skillTargetsOpponent,
} from './helpers';

// Game engine logic
export {
  addRoomFields,
  applySkillSelection,
  decrementSkillCooldowns,
  decrementStatusDurations,
  initGameState,
  markWinner,
  processPlayerTurn,
  removePlayerFromOrder,
  setSkillCooldown,
  updateRoomOrderId,
} from './engine';

// Socket handlers
export { registerHandlers } from './handlers';

// Re-export shared types for server use
export type {
  ActiveSkill,
  GameAction,
  HealingSkill,
  LogStep,
  PassiveSkill,
  Player,
  Room,
  Skill,
  StatusEffect,
} from '../shared';

// Re-export handler context type
export type { GameHandlerContext } from '@game/shared/engine';
