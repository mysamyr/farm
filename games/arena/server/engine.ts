import { ROOM_STATES } from '@game/shared/constants';
import { shuffleArray } from '@game/shared/utils';

import {
  ActionTarget,
  ActionType,
  type ActiveSkill,
  ApplyStatusAction,
  CleanseAction,
  HealAction,
  LifeStealAction,
  BASE_SKILLS,
  DamageAction,
  EffectId,
  type GameAction,
  getPlayerMaxHp,
  type HealingSkill,
  type LogEffect,
  LogEffectKind,
  ModifyStatAction,
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
  getPierce,
  getPlayerMinHp,
  getPlayerStats,
  getThorns,
  isDead,
  isPlayerResistant,
  isStunned,
  PlayerStats,
  rollChance,
  skillTargetsOpponent,
  splitOpponentActions,
  splitSelfActions,
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
        });
      }
      if (action.type === ActionType.APPLY_STATUS) {
        acc.push({
          type: action.status,
          value: action.value ?? 0,
        });
      }
      return acc;
    }, [])
  );
}

function applyHeal(player: Player, heal: number): number {
  const maxHp = getPlayerMaxHp(player);
  const startHP = player.hp;
  const newHP = Math.min(player.hp + heal, maxHp);
  player.hp = newHP;

  return newHP - startHP;
}

function applyDamage(player: Player, damage: number): void {
  const minHp = getPlayerMinHp(player);
  player.hp = Math.max(player.hp - damage, minHp);
}

function applyCleansing(
  player: Player,
  actions: CleanseAction[],
  ctx: TurnContext = NO_CONTEXT
): void {
  if (actions.length) {
    player.statuses = player.statuses.filter(
      s => !NEGATIVE_EFFECTS.includes(s.type as EffectId)
    );

    ctx.addEffect({
      kind: LogEffectKind.cleanse,
      target: ActionTarget.self,
    });
  }
}

function processStatusEffects(
  player: Player,
  ctx: TurnContext = NO_CONTEXT
): void {
  for (const status of player.statuses) {
    const playerHp = getPlayerStats(player).hp;
    switch (status.type) {
      case EffectId.poison: {
        const damage = status.value;
        applyDamage(player, damage);
        ctx.addEffect({
          kind: LogEffectKind.poison,
          value: damage,
          target: ActionTarget.self,
        });
        if (player.hp === 0) return;
        break;
      }
      case EffectId.bleed: {
        const damage = Math.max(Math.floor((playerHp * status.value) / 100), 1);
        applyDamage(player, damage);
        ctx.addEffect({
          kind: LogEffectKind.bleed,
          value: damage,
          target: ActionTarget.self,
        });
        if (player.hp === 0) return;
        break;
      }
      case EffectId.regeneration: {
        const healed = applyHeal(player, status.value);
        if (healed > 0) {
          ctx.addEffect({
            kind: LogEffectKind.regeneration,
            value: healed,
            target: ActionTarget.self,
          });
        }
        break;
      }
    }
  }
}

function applyHealActions(
  player: Player,
  actions: HealAction[],
  ctx: TurnContext = NO_CONTEXT
): void {
  for (const action of actions) {
    const healed = applyHeal(player, action.value);
    if (healed > 0) {
      ctx.addEffect({
        kind: LogEffectKind.heal,
        value: healed,
        target: ActionTarget.self,
      });
    }
  }
}

function applyStatusEffectsToSelf(
  player: Player,
  actions: ApplyStatusAction[],
  ctx: TurnContext = NO_CONTEXT
): void {
  for (const action of actions) {
    player.statuses.push({
      type: action.status,
      value: action.value ?? 0,
      remainingDuration: action.duration ?? Infinity,
      isPercent: 'isPercent' in action ? action.isPercent : undefined,
    });
    ctx.addEffect({
      kind: LogEffectKind.apply_status,
      target: ActionTarget.self,
      status: action.status,
      duration: action.duration ?? Infinity,
      value: action.value ?? 0,
    } as LogEffect);
  }
}

function applyLifeSteal(
  player: Player,
  actions: LifeStealAction[],
  damageDealt: number,
  ctx: TurnContext = NO_CONTEXT
): void {
  for (const action of actions) {
    const heal = Math.max(Math.floor((damageDealt * action.value) / 100), 1);
    const healed = applyHeal(player, heal);
    if (healed > 0) {
      ctx.addEffect({
        kind: LogEffectKind.lifesteal,
        value: healed,
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
    kind: LogEffectKind.thorns,
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

  const heal = Math.max(Math.floor((totalDamageDealt * leech) / 100), 1);
  const healed = applyHeal(player, heal);
  if (healed > 0) {
    ctx.addEffect({
      kind: LogEffectKind.leech,
      value: healed,
      target: ActionTarget.self,
    });
  }
}

function applyDamageToOpponent(
  player: Player,
  opponent: Player,
  actions: DamageAction[],
  lifeStealActions: LifeStealAction[],
  attackerStats: PlayerStats,
  defenderStats: PlayerStats,
  ctx: TurnContext = NO_CONTEXT
): void {
  const isCrit = rollChance(attackerStats.crit);
  const pierce = getPierce(player);

  let totalDamageDealt = 0;

  for (const action of actions) {
    const damage = calculateDamage(
      action.value,
      attackerStats.attack,
      defenderStats.armor - pierce,
      isCrit
    );
    applyDamage(opponent, damage);
    totalDamageDealt += damage;
  }

  if (totalDamageDealt === 0) return;

  ctx.addEffect({
    kind: LogEffectKind.damage,
    value: totalDamageDealt,
    target: ActionTarget.opponent,
    isCrit,
  });

  // Damage reactions
  const thorns = getThorns(opponent);
  applyThorns(player, totalDamageDealt, thorns, ctx);

  // Damage rewards
  applyLifeSteal(player, lifeStealActions, totalDamageDealt, ctx);

  const leech = getLeech(player);
  applyLeech(player, totalDamageDealt, leech, ctx);
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
    ctx.addEffect({ kind: LogEffectKind.dodge, target: ActionTarget.opponent });
    return;
  }

  const [damageActions, lifeStealActions, statusActions, modifyStatActions] =
    splitOpponentActions(actions);

  // Direct damage
  applyDamageToOpponent(
    player,
    opponent,
    damageActions,
    lifeStealActions,
    attackerStats,
    defenderStats,
    ctx
  );

  // Effects
  applyStatusEffectsToOpponent(opponent, statusActions, ctx);
  applyModifyStats(opponent, modifyStatActions, ctx);
}

function applyStatusEffectsToOpponent(
  opponent: Player,
  actions: ApplyStatusAction[],
  ctx: TurnContext = NO_CONTEXT
): void {
  const hasResistance = isPlayerResistant(opponent);
  for (const action of actions) {
    switch (action.status) {
      case EffectId.bleed: {
        if (hasResistance) {
          ctx.addEffect({
            kind: LogEffectKind.resist,
            status: action.status,
            target: ActionTarget.opponent,
          });
          return;
        }
        const existing = opponent.statuses.find(s => s.type === action.status);
        if (existing) {
          existing.remainingDuration = action.duration;
        } else {
          opponent.statuses.push({
            type: action.status,
            value: action.value,
            remainingDuration: action.duration,
            isPercent: true,
          });
        }
        ctx.addEffect({
          kind: LogEffectKind.apply_status,
          target: ActionTarget.opponent,
          status: action.status,
          duration: action.duration,
          value: action.value,
        });
        break;
      }
      case EffectId.poison: {
        if (hasResistance) {
          ctx.addEffect({
            kind: LogEffectKind.resist,
            status: action.status,
            target: ActionTarget.opponent,
          });
          return;
        }
        const existing = opponent.statuses.find(s => s.type === action.status);
        if (existing) {
          existing.remainingDuration = action.duration;
        } else {
          opponent.statuses.push({
            type: action.status,
            value: action.value,
            remainingDuration: action.duration,
          });
        }
        ctx.addEffect({
          kind: LogEffectKind.apply_status,
          target: ActionTarget.opponent,
          status: action.status,
          duration: action.duration,
          value: action.value,
        });
        break;
      }
      case EffectId.stun: {
        opponent.statuses.push({
          type: action.status,
          value: 0,
          remainingDuration: action.duration,
        });
        ctx.addEffect({
          kind: LogEffectKind.apply_status,
          target: ActionTarget.opponent,
          status: action.status,
          duration: action.duration,
        });
        break;
      }
      default: {
        opponent.statuses.push({
          type: action.status,
          value: action.value ?? 0,
          remainingDuration: action.duration ?? Infinity,
          isPercent: action.isPercent,
        });
        ctx.addEffect({
          kind: LogEffectKind.apply_status,
          target: ActionTarget.opponent,
          status: action.status,
          duration: action.duration ?? Infinity,
          value: action.value ?? 0,
        } as LogEffect);
      }
    }
  }
}

function applyModifyStats(
  player: Player,
  actions: ModifyStatAction[],
  ctx: TurnContext = NO_CONTEXT
): void {
  for (const action of actions) {
    player.statuses.push({
      type: action.stat,
      value: action.value ?? 0,
      remainingDuration: action.duration ?? Infinity,
    });
    ctx.addEffect({
      kind: LogEffectKind.modify_stat,
      target: action.target,
      stat: action.stat,
      value: action.value ?? 0,
      duration: action.duration,
    });
  }
}

function decrementStatusDurations(player: Player): void {
  player.statuses = player.statuses.filter(s => {
    if (s.remainingDuration === undefined) return true;
    s.remainingDuration -= 1;
    return s.remainingDuration > 0;
  });
}

function decrementSkillCooldowns(player: Player, skillId: SkillId): void {
  for (const skill of player.skills) {
    if (skill.id === skillId) continue;
    skill.cooldown = Math.max(skill.cooldown - 1, 0);
  }
}

function resetSkillCooldown(player: Player, skillId: SkillId): void {
  const playerSkill = player.skills.find(s => s.id === skillId);
  if (!playerSkill) return;

  const skillDef = SKILLS[skillId];
  if (
    skillDef?.type === SkillType.active ||
    skillDef?.type === SkillType.healing
  ) {
    playerSkill.cooldown = skillDef.cooldown;
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

  const effects: LogEffect[] = [];
  const ctx: TurnContext = { addEffect: e => effects.push(e) };

  const [applyStatusActions, modifyStatActions, healActions, cleanseActions] =
    splitSelfActions(skill.actions);

  applyCleansing(player, cleanseActions, ctx);

  processStatusEffects(player, ctx);

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
  applyHealActions(player, healActions, ctx);
  applyStatusEffectsToSelf(player, applyStatusActions, ctx);
  applyModifyStats(player, modifyStatActions, ctx);

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

  resetSkillCooldown(player, skillId);

  if (!isStunned(player)) {
    decrementSkillCooldowns(player, skillId);
  }

  decrementStatusDurations(player);

  setNextTurn(room);

  return { dead: null };
}
