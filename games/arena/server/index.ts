export { BASE_SKILLS, DEFAULT_CONFIG, SKILLS } from '../shared/index.js';

export type { TurnContext } from './types.js';

export { NO_CONTEXT, TURN_START_INDEX } from './constants.js';

export {
  calculateDamage,
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
} from './helpers.js';

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
} from './engine.js';

export { handleAction } from './handlers.js';

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
} from '../shared/index.js';

export type { GameHandlerContext } from '@game/shared/engine';
