import { ROOM_STATES } from '@game/shared/constants';
import { shuffleArray } from '@game/shared/utils';

import {
  ActionTarget,
  ActionType,
  type ActiveSkill,
  BASE_SKILLS,
  EffectId,
  type GameAction,
  type HealingSkill,
  type LogEffect,
  NEGATIVE_EFFECTS,
  type PassiveSkill,
  type Player,
  type Room,
  type SkillId,
  SKILLS,
  SkillType,
  type StatusEffect,
} from '../shared/index.js';

import { NO_CONTEXT, TURN_START_INDEX } from './constants.js';
import {
  calculateDamage,
  getActivePlayer,
  getLeech,
  getOpponent,
  getPlayerMaxHp,
  getPlayerMinHp,
  getPlayerStats,
  getThorns,
  isDead,
  isPlayerResistant,
  isStunned,
  rollChance,
  skillTargetsOpponent,
} from './helpers.js';
import type { TurnContext } from './types.js';

export function addRoomFields(): Pick<
  Room,
  'rules' | 'order' | 'turn' | 'steps'
> {
  return {
    order: [],
    rules: {},
    turn: TURN_START_INDEX,
    steps: [],
  };
}

function setOrder(room: Room): void {
  room.order = shuffleArray(room.players.map(p => p.id));
}

export function initGameState(room: Room): void {
  setOrder(room);
}

export function removePlayerFromOrder(room: Room, playerId: string): void {
  const idx: number = room.order.indexOf(playerId);
  room.order.splice(idx, 1);
  if (room.turn >= room.order.length) {
    room.turn = TURN_START_INDEX;
  }
}

export function updateRoomOrderId(
  room: Room,
  oldId: string,
  newId: string
): void {
  room.order = room.order.map(id => (id === oldId ? newId : id));
}

export function markWinner(room: Room, player: Player): void {
  room.state = ROOM_STATES.FINISHED;
  room.winner = player.id;
}

export function applySkillSelection(player: Player, skills: SkillId[]): void {
  const [activeSkills, healingSkills, passiveSkills] = skills.reduce<
    [ActiveSkill[], HealingSkill[], PassiveSkill[]]
  >(
    (acc, id) => {
      const skill = SKILLS[id];
      if (!skill) return acc;
      if (skill.type === SkillType.active) acc[0].push(skill);
      else if (skill.type === SkillType.healing) acc[1].push(skill);
      else if (skill.type === SkillType.passive) acc[2].push(skill);
      return acc;
    },
    [[], [], []]
  );

  player.skills = [
    ...BASE_SKILLS.map(id => ({ id, cooldown: 0 })),
    ...activeSkills.map(s => ({ id: s.id, cooldown: s.cooldown })),
    ...healingSkills.map(s => ({ id: s.id, cooldown: s.cooldown })),
  ];
  player.statuses = passiveSkills.flatMap(s =>
    s.actions.reduce((acc: StatusEffect[], action: GameAction) => {
      if (action.type === ActionType.MODIFY_STAT) {
        acc.push({
          type: action.stat,
          value: action.value ?? 0,
          remainingDuration: 0,
          permanent: true,
        });
      }
      if (action.type === ActionType.APPLY_STATUS) {
        acc.push({
          type: action.status,
          value: action.value ?? 0,
          remainingDuration: 0,
          permanent: true,
        });
      }
      return acc;
    }, [])
  );
}

function applyHeal(player: Player, heal: number): void {
  const maxHp = getPlayerMaxHp(player);
  player.hp = Math.min(player.hp + heal, maxHp);
}

function applyDamage(player: Player, damage: number): void {
  const minHp = getPlayerMinHp(player);
  player.hp = Math.max(player.hp - damage, minHp);
}

function cleanseNegativeEffects(player: Player): void {
  player.statuses = player.statuses.filter(
    s => !NEGATIVE_EFFECTS.includes(s.type as EffectId)
  );
}

function processStatusEffects(
  player: Player,
  actions: GameAction[],
  ctx: TurnContext = NO_CONTEXT
): void {
  // Clear negative effects before processing
  if (actions.some(a => a.type === ActionType.CLEANSE)) {
    cleanseNegativeEffects(player);
  }
  for (const status of player.statuses) {
    const playerHp = getPlayerStats(player).hp;
    switch (status.type) {
      case EffectId.poison: {
        const damage = status.value;
        applyDamage(player, damage);
        ctx.addEffect({
          kind: status.type,
          value: damage,
          target: ActionTarget.self,
        });
        break;
      }
      case EffectId.bleed: {
        const damage = Math.max(Math.floor((playerHp * status.value) / 100), 1);
        applyDamage(player, damage);
        ctx.addEffect({
          kind: status.type,
          value: damage,
          target: ActionTarget.self,
        });
        break;
      }
      case EffectId.regeneration: {
        const heal = status.isPercent
          ? Math.max(Math.floor((playerHp * status.value) / 100), 1)
          : status.value;
        applyHeal(player, heal);
        if (heal > 0) {
          ctx.addEffect({
            kind: 'regeneration',
            value: heal,
            target: ActionTarget.self,
          });
        }
        break;
      }
    }
  }
}

function applySkillToSelf(
  player: Player,
  actions: GameAction[],
  ctx: TurnContext = NO_CONTEXT
): void {
  // Only positive effects
  for (const action of actions) {
    if (action.target !== ActionTarget.self) continue;

    if (action.type === ActionType.HEAL) {
      const playerHp = getPlayerStats(player).hp;
      const heal = action.isPercent
        ? Math.max(Math.floor((playerHp * action.value) / 100), 1)
        : action.value;
      applyHeal(player, heal);
      ctx.addEffect({ kind: 'heal', value: heal, target: ActionTarget.self });
    }
    if (action.type === ActionType.APPLY_STATUS) {
      player.statuses.push({
        type: action.status,
        value: action.value ?? 0,
        remainingDuration: action.duration,
        isPercent: action.isPercent,
      });
    }
  }
}

function applyLifesteal(
  player: Player,
  actions: GameAction[],
  damageDealt: number,
  ctx: TurnContext = NO_CONTEXT
): void {
  for (const action of actions) {
    if (action.type === ActionType.LIFE_STEAL) {
      const heal = Math.max(Math.floor((damageDealt * action.value) / 100), 1);
      applyHeal(player, heal);
      ctx.addEffect({
        kind: 'lifesteal',
        value: heal,
        target: ActionTarget.self,
      });
    }
  }
}

function applyThorns(
  attacker: Player,
  totalDamageDealt: number,
  thorns: number,
  ctx: TurnContext = NO_CONTEXT
): void {
  if (totalDamageDealt <= 0 || thorns <= 0) return;
  // Thorns: reflect % of direct damage back to attacker
  const reflected = Math.max(Math.floor((totalDamageDealt * thorns) / 100), 1);
  applyDamage(attacker, reflected);
  ctx.addEffect({
    kind: 'thorns',
    value: reflected,
    target: ActionTarget.self,
  });
}

function applyLeech(
  player: Player,
  totalDamageDealt: number,
  leech: number,
  ctx: TurnContext = NO_CONTEXT
): void {
  if (totalDamageDealt <= 0 || leech <= 0) return;
  // Leech: return % of direct damage as health to attacker
  const heal = Math.max(Math.floor((totalDamageDealt * leech) / 100), 1);
  applyHeal(player, heal);
  ctx.addEffect({ kind: 'leech', value: heal, target: ActionTarget.self });
}

function applySkillToOpponent(
  player: Player,
  opponent: Player,
  actions: GameAction[],
  ctx: TurnContext = NO_CONTEXT
): void {
  const attackerStats = getPlayerStats(player);
  const defenderStats = getPlayerStats(opponent);

  if (rollChance(defenderStats.dodge)) {
    ctx.addEffect({ kind: 'dodge', value: 0, target: ActionTarget.opponent });
    return;
  }

  const isCrit = rollChance(attackerStats.crit);
  const hasResistance = isPlayerResistant(opponent);
  const thorns = getThorns(opponent);
  const leech = getLeech(player);

  let totalDamageDealt = 0;

  for (const action of actions) {
    if (action.target !== ActionTarget.opponent) continue;

    if (action.type === ActionType.DAMAGE) {
      const baseValue = action.isPercent
        ? Math.floor((defenderStats.hp * action.value) / 100)
        : action.value;
      const damage = calculateDamage(
        baseValue,
        attackerStats.attack,
        defenderStats.armor,
        isCrit
      );
      applyDamage(opponent, damage);
      totalDamageDealt += damage;
    }
    if (action.type === ActionType.APPLY_STATUS) {
      applyStatusToOpponent(opponent, action, hasResistance);
    }
  }

  if (totalDamageDealt > 0) {
    ctx.addEffect({
      kind: 'damage',
      value: totalDamageDealt,
      target: ActionTarget.opponent,
      isCrit,
    });
  }

  applyThorns(player, totalDamageDealt, thorns, ctx);

  applyLifesteal(player, actions, totalDamageDealt, ctx);

  applyLeech(player, totalDamageDealt, leech, ctx);
}

function applyStatusToOpponent(
  opponent: Player,
  action: GameAction & { type: ActionType.APPLY_STATUS },
  hasResistance: boolean
): void {
  switch (action.status) {
    case EffectId.bleed:
    case EffectId.poison: {
      if (hasResistance) return;
      const existing = opponent.statuses.find(s => s.type === action.status);
      if (existing) {
        existing.remainingDuration = action.duration;
      } else {
        opponent.statuses.push({
          type: action.status,
          value: action.value ?? 0,
          remainingDuration: action.duration,
          isPercent: action.isPercent,
        });
      }
      break;
    }
    case EffectId.stun: {
      opponent.statuses.push({
        type: action.status,
        value: action.value ?? 0,
        remainingDuration: action.duration,
      });
      break;
    }
    default: {
      opponent.statuses.push({
        type: action.status,
        value: action.value ?? 0,
        remainingDuration: action.duration,
        isPercent: action.isPercent,
      });
    }
  }
}

export function decrementStatusDurations(player: Player): void {
  player.statuses = player.statuses.filter(s => {
    if (s.permanent) return true;
    s.remainingDuration -= 1;
    return s.remainingDuration > 0;
  });
}

export function decrementSkillCooldowns(player: Player): void {
  for (const skill of player.skills) {
    skill.cooldown = Math.max(skill.cooldown - 1, 0);
  }
}

export function setSkillCooldown(player: Player, skillId: SkillId): void {
  const playerSkill = player.skills.find(s => s.id === skillId);
  if (!playerSkill) return;

  const skillDef = SKILLS[skillId];
  if (
    skillDef?.type === SkillType.active ||
    skillDef?.type === SkillType.healing
  ) {
    playerSkill.cooldown = skillDef.cooldown + 1; // +1 because cooldown decrements at end of turn
  }
}

function setNextTurn(room: Room): void {
  room.turn = (room.turn + 1) % room.order.length;
}

export function processPlayerTurn(
  room: Room,
  skillId: SkillId
): { dead: 'attacker' | 'defender' | null } {
  const player = getActivePlayer(room)!;
  const skill = SKILLS[skillId];
  if (
    !skill ||
    (skill.type !== SkillType.active && skill.type !== SkillType.healing)
  ) {
    return { dead: null };
  }

  const effects: LogEffect[] = [];
  const ctx: TurnContext = { addEffect: e => effects.push(e) };

  processStatusEffects(player, skill.actions, ctx);
  if (isDead(player)) {
    room.steps.push({
      step: room.steps.length + 1,
      playerId: player.id,
      playerName: player.name,
      skillId,
      effects,
    });
    return { dead: 'attacker' };
  }

  applySkillToSelf(player, skill.actions, ctx);

  let dead: 'attacker' | 'defender' | null = null;

  if (skillTargetsOpponent(skill.actions)) {
    const opponent = getOpponent(room, player.id)!;

    applySkillToOpponent(player, opponent, skill.actions, ctx);

    if (isDead(opponent)) {
      dead = 'defender';
    } else if (isDead(player)) {
      dead = 'attacker';
    }
  }

  room.steps.push({
    step: room.steps.length + 1,
    playerId: player.id,
    playerName: player.name,
    skillId,
    effects,
  });

  if (dead) return { dead };

  setSkillCooldown(player, skillId);

  decrementStatusDurations(player);
  if (!isStunned(player)) {
    decrementSkillCooldowns(player);
  }

  setNextTurn(room);

  return { dead: null };
}
