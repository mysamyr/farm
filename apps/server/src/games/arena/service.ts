import {
  ROOM_STATES,
  EVENTS,
  NOTIFICATION_TYPES,
} from '@game/shared/constants';
import { BASE_SKILLS, SKILLS } from '@game/shared/constants/arena';
import type {
  ActiveSkill,
  GameAction,
  LogEffect,
  PassiveSkill,
  Player,
  Room,
  SkillId,
  StatusEffect,
} from '@game/shared/types/arena';

import { LogLevel } from '../../constants';
import { log } from '../../services/logger';
import type { AppServer } from '../../types';

import { shuffleArray } from '../../utils';

import { NO_CONTEXT, TURN_START_INDEX } from './constants';
import {
  calculateDamage,
  getActivePlayer,
  getOpponent,
  getPlayerMaxHp,
  getPlayerMinHp,
  getPlayerStats,
  isDead,
  isStunned,
  rollChance,
  skillTargetsOpponent,
} from './helpers';
import type { TurnContext } from './types';

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

export function initGameState(_io: AppServer, room: Room): void {
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

export function winnerHandler(io: AppServer, room: Room, player: Player): void {
  room.state = ROOM_STATES.FINISHED;
  room.winner = player.id;

  log(LogLevel.INFO, 'game:finished', {
    roomId: room.id,
    winnerId: player.id,
    winnerName: player.name,
  });

  io.to(room.id).emit(EVENTS.NOTIFICATION, {
    type: NOTIFICATION_TYPES.GAME_FINISHED,
    data: player.name,
  });
}

export function applySkillSelection(player: Player, skills: SkillId[]): void {
  const [activeSkills, passiveSkills] = skills.reduce<
    [ActiveSkill[], PassiveSkill[]]
  >(
    (acc, id) => {
      const skill = SKILLS.find(s => s.id === id);
      if (!skill) return acc;
      if (skill.type === 'active') acc[0].push(skill);
      else if (skill.type === 'passive') acc[1].push(skill);
      return acc;
    },
    [[], []]
  );

  player.skills = [
    ...BASE_SKILLS.map(s => ({ id: s.id, cooldown: 0 })),
    ...activeSkills.map(s => ({ id: s.id, cooldown: s.cooldown })),
  ];
  player.statuses = passiveSkills.flatMap(s =>
    s.actions.reduce((acc: StatusEffect[], action: GameAction) => {
      if (action.type === 'MODIFY_STAT') {
        acc.push({
          type: action.stat,
          value: action.value ?? 0,
          remainingDuration: 0,
          permanent: true,
        });
      }
      if (action.type === 'APPLY_STATUS') {
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

function processStatusEffects(
  player: Player,
  ctx: TurnContext = NO_CONTEXT
): void {
  for (const status of player.statuses) {
    const playerHp = getPlayerStats(player).hp;
    switch (status.type) {
      case 'poison': {
        const damage = status.value;
        applyDamage(player, damage);
        ctx.addEffect({ kind: status.type, value: damage, target: 'self' });
        break;
      }
      case 'bleed': {
        const damage = Math.max(Math.floor((playerHp * status.value) / 100), 1);
        applyDamage(player, damage);
        ctx.addEffect({ kind: status.type, value: damage, target: 'self' });
        break;
      }
      case 'regeneration': {
        const heal = status.isPercent
          ? Math.max(Math.floor((playerHp * status.value) / 100), 1)
          : status.value;
        applyHeal(player, heal);
        if (heal > 0)
          ctx.addEffect({ kind: 'regeneration', value: heal, target: 'self' });
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
  for (const action of actions) {
    if (action.target !== 'self') continue;

    if (action.type === 'HEAL') {
      const playerHp = getPlayerStats(player).hp;
      const heal = action.isPercent
        ? Math.max(Math.floor((playerHp * action.value) / 100), 1)
        : action.value;
      applyHeal(player, heal);
      ctx.addEffect({ kind: 'heal', value: heal, target: 'self' });
    }
    if (action.type === 'APPLY_STATUS') {
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
    if (action.type === 'LIFESTEAL') {
      const heal = Math.max(Math.floor((damageDealt * action.value) / 100), 1);
      applyHeal(player, heal);
      ctx.addEffect({ kind: 'lifesteal', value: heal, target: 'self' });
    }
  }
}

function applyThorns(
  player: Player,
  totalDamageDealt: number,
  thorns: number,
  ctx: TurnContext = NO_CONTEXT
): void {
  // Thorns: reflect % of direct damage back to attacker
  const reflected = Math.max(Math.floor((totalDamageDealt * thorns) / 100), 1);
  applyDamage(player, reflected);
  ctx.addEffect({ kind: 'thorns', value: reflected, target: 'self' });
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
    ctx.addEffect({ kind: 'dodge', value: 0, target: 'opponent' });
    return;
  }

  const isCrit = rollChance(attackerStats.crit);
  const hasResistance = opponent.statuses.some(
    s => s.type === 'resistance' && (s.permanent || s.remainingDuration > 0)
  );
  const thorns = opponent.statuses.find(
    s => s.type === 'thorns' && (s.permanent || s.remainingDuration > 0)
  );

  let totalDamageDealt = 0;

  for (const action of actions) {
    if (action.target !== 'opponent') continue;

    if (action.type === 'DAMAGE') {
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
    if (action.type === 'APPLY_STATUS') {
      applyStatusToOpponent(opponent, action, hasResistance);
    }
  }

  if (totalDamageDealt > 0) {
    ctx.addEffect({
      kind: 'damage',
      value: totalDamageDealt,
      target: 'opponent',
      isCrit,
    });
  }

  if (thorns && totalDamageDealt > 0) {
    applyThorns(player, totalDamageDealt, thorns.value, ctx);
  }

  applyLifesteal(player, actions, totalDamageDealt, ctx);
}

function applyStatusToOpponent(
  opponent: Player,
  action: GameAction & { type: 'APPLY_STATUS' },
  hasResistance: boolean
): void {
  switch (action.status) {
    case 'bleed':
    case 'poison': {
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
    case 'stun': {
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

  const skillDef = SKILLS.find(s => s.id === skillId);
  if (skillDef?.type === 'active') {
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
  const skill = SKILLS.find(s => s.id === skillId);
  if (!skill || skill.type !== 'active') return { dead: null };

  const effects: LogEffect[] = [];
  const ctx: TurnContext = { addEffect: e => effects.push(e) };

  processStatusEffects(player, ctx);
  if (isDead(player)) {
    log(LogLevel.DEBUG, 'player:dead', { player, reason: 'status_effects' });
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
      log(LogLevel.DEBUG, 'player:dead', {
        player: opponent,
        reason: 'skill_damage',
      });
      dead = 'defender';
    } else if (isDead(player)) {
      log(LogLevel.DEBUG, 'player:dead', {
        player,
        reason: 'thorns_reflection',
      });
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
