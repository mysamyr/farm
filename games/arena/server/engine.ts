import { ROOM_STATES } from '@game/shared/constants';
import { shuffleArray } from '@game/shared/utils';

import {
  ActionTarget,
  type ActiveSkill,
  ApplyStatusAction,
  BASE_SKILLS,
  CleanseAction,
  DamageAction,
  DEFAULT_PLAYER_STATS,
  EffectId,
  GAME_RULES,
  type GameAction,
  getPlayerMaxHp,
  getStatusesFromSkills,
  HealAction,
  type HealingSkill,
  LifeStealAction,
  type LogEffect,
  LogEffectKind,
  ModifyStatAction,
  NEGATIVE_EFFECTS,
  type Player,
  resolveActionValue,
  type Room,
  type SkillId,
  SKILLS,
  SkillType,
  type StatusEffect,
  type ValueContext,
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
  isPlayerReflecting,
  isPlayerResistant,
  isSameTurnDeferred,
  isStunned,
  PlayerStats,
  rollChance,
  skillTargetsOpponent,
  splitOpponentActions,
  splitSelfActions,
  stampDeferredAppliedTurn,
} from './helpers.js';
import type { TurnContext } from './types.js';

export function addRoomFields(): Pick<
  Room,
  'rules' | 'order' | 'turn' | 'steps'
> {
  return {
    order: [],
    rules: Object.values(GAME_RULES).reduce(
      (acc, rule) => {
        acc[rule] = false;
        return acc;
      },
      {} as Record<GAME_RULES, boolean>
    ),
    turn: TURN_START_INDEX,
    steps: [],
  };
}

function setOrder(room: Room): void {
  room.order = shuffleArray(room.players.map(p => p.id));
}

export function initGameState(room: Room): void {
  setOrder(room);
  delete room.winner;
  room.steps = [];

  room.players.forEach(player => {
    player.hp = DEFAULT_PLAYER_STATS.hp;
    player.skills = [];
    player.statuses = [];
    player.ready = false;
  });
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

export function applySkillSelection(
  player: Player,
  skills: SkillId[],
  zeroCd: boolean
): void {
  const [activeSkills, healingSkills] = skills.reduce<
    [ActiveSkill[], HealingSkill[]]
  >(
    (acc, id) => {
      const skill = SKILLS[id];
      if (!skill) return acc;
      if (skill.type === SkillType.active) acc[0].push(skill);
      else if (skill.type === SkillType.healing) acc[1].push(skill);
      return acc;
    },
    [[], []]
  );

  player.skills = [
    ...BASE_SKILLS.map(id => ({ id, cooldown: 0 })),
    ...activeSkills.map(s => ({
      id: s.id,
      cooldown: zeroCd ? 0 : s.cooldown,
    })),
    ...healingSkills.map(s => ({
      id: s.id,
      cooldown: zeroCd ? 0 : s.cooldown,
    })),
  ];
  player.statuses = getStatusesFromSkills(skills, player);
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
  ctx: TurnContext = NO_CONTEXT,
  currentTurnId = -1
): void {
  for (const status of player.statuses) {
    if (isSameTurnDeferred(status, currentTurnId)) continue;
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
  valueCtx: ValueContext,
  ctx: TurnContext = NO_CONTEXT
): void {
  for (const action of actions) {
    const healed = applyHeal(
      player,
      resolveActionValue(action.value, valueCtx)
    );
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
  valueCtx: ValueContext,
  ctx: TurnContext = NO_CONTEXT,
  currentTurnId = -1
): void {
  for (const action of actions) {
    const value = action.value ? resolveActionValue(action.value, valueCtx) : 0;
    const status: StatusEffect = {
      type: action.status,
      value,
      remainingDuration: action.duration ?? Infinity,
    };
    stampDeferredAppliedTurn(status, currentTurnId);
    player.statuses.push(status);
    ctx.addEffect({
      kind: LogEffectKind.apply_status,
      target: ActionTarget.self,
      status: action.status,
      duration: action.duration ?? Infinity,
      value,
    } as LogEffect);
  }
}

function applyLifeSteal(
  player: Player,
  actions: LifeStealAction[],
  valueCtx: ValueContext,
  ctx: TurnContext = NO_CONTEXT
): void {
  for (const action of actions) {
    const heal = Math.max(resolveActionValue(action.value, valueCtx), 1);
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
  valueCtx: ValueContext,
  ctx: TurnContext = NO_CONTEXT
): number {
  const isCrit = rollChance(attackerStats.crit);
  const pierce = getPierce(player);

  let totalDamageDealt = 0;

  for (const action of actions) {
    const damage = calculateDamage(
      resolveActionValue(action.value, valueCtx),
      attackerStats.attack,
      defenderStats.armor - pierce,
      isCrit
    );
    applyDamage(opponent, damage);
    totalDamageDealt += damage;
  }

  if (totalDamageDealt === 0) return 0;

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
  applyLifeSteal(
    player,
    lifeStealActions,
    { ...valueCtx, damageDealt: totalDamageDealt },
    ctx
  );

  const leech = getLeech(player);
  applyLeech(player, totalDamageDealt, leech, ctx);

  return totalDamageDealt;
}

function applySkillToOpponent(
  player: Player,
  opponent: Player,
  actions: GameAction[],
  ctx: TurnContext = NO_CONTEXT,
  currentTurnId = -1
): void {
  const attackerStats = getPlayerStats(player);
  const defenderStats = getPlayerStats(opponent);

  if (rollChance(defenderStats.dodge)) {
    ctx.addEffect({ kind: LogEffectKind.dodge, target: ActionTarget.opponent });
    return;
  }

  const [damageActions, lifeStealActions, statusActions, modifyStatActions] =
    splitOpponentActions(actions);

  const valueCtx: ValueContext = { self: player, opponent };

  // Direct damage
  const totalDamageDealt = applyDamageToOpponent(
    player,
    opponent,
    damageActions,
    lifeStealActions,
    attackerStats,
    defenderStats,
    valueCtx,
    ctx
  );

  const statusValueCtx = { ...valueCtx, damageDealt: totalDamageDealt };
  const statusDebuffs = statusActions.filter(a =>
    NEGATIVE_EFFECTS.includes(a.status)
  );
  const otherStatuses = statusActions.filter(
    a => !NEGATIVE_EFFECTS.includes(a.status)
  );
  const statDebuffs = modifyStatActions.filter(
    a => resolveActionValue(a.value, valueCtx) < 0
  );
  const otherStatMods = modifyStatActions.filter(
    a => resolveActionValue(a.value, valueCtx) >= 0
  );

  const reflecting = isPlayerReflecting(opponent);
  if (reflecting && (statusDebuffs.length > 0 || statDebuffs.length > 0)) {
    ctx.addEffect({
      kind: LogEffectKind.reflect,
      target: ActionTarget.opponent,
    });
    applyStatusEffectsToTarget(
      player,
      statusDebuffs,
      statusValueCtx,
      ctx,
      ActionTarget.self,
      currentTurnId
    );
    applyModifyStats(
      player,
      statDebuffs,
      valueCtx,
      ctx,
      ActionTarget.self,
      currentTurnId
    );
  } else {
    applyStatusEffectsToTarget(
      opponent,
      statusDebuffs,
      statusValueCtx,
      ctx,
      ActionTarget.opponent,
      currentTurnId
    );
    applyModifyStats(
      opponent,
      statDebuffs,
      valueCtx,
      ctx,
      ActionTarget.opponent,
      currentTurnId
    );
  }

  applyStatusEffectsToTarget(
    opponent,
    otherStatuses,
    statusValueCtx,
    ctx,
    ActionTarget.opponent,
    currentTurnId
  );
  applyModifyStats(
    opponent,
    otherStatMods,
    valueCtx,
    ctx,
    ActionTarget.opponent,
    currentTurnId
  );
}

function applyStatusEffectsToTarget(
  target: Player,
  actions: ApplyStatusAction[],
  valueCtx: ValueContext,
  ctx: TurnContext = NO_CONTEXT,
  logTarget: ActionTarget = ActionTarget.opponent,
  currentTurnId = -1
): void {
  const hasResistance = isPlayerResistant(target);
  for (const action of actions) {
    switch (action.status) {
      case EffectId.bleed: {
        if (hasResistance) {
          ctx.addEffect({
            kind: LogEffectKind.resist,
            status: action.status,
            target: logTarget,
          });
          break;
        }
        const value = resolveActionValue(action.value, valueCtx);
        const existing = target.statuses.find(s => s.type === action.status);
        if (existing) {
          existing.remainingDuration = action.duration;
          stampDeferredAppliedTurn(existing, currentTurnId);
        } else {
          const status: StatusEffect = {
            type: action.status,
            value,
            remainingDuration: action.duration,
          };
          stampDeferredAppliedTurn(status, currentTurnId);
          target.statuses.push(status);
        }
        ctx.addEffect({
          kind: LogEffectKind.apply_status,
          target: logTarget,
          status: action.status,
          duration: action.duration,
          value,
        });
        break;
      }
      case EffectId.poison: {
        if (hasResistance) {
          ctx.addEffect({
            kind: LogEffectKind.resist,
            status: action.status,
            target: logTarget,
          });
          break;
        }
        const value = resolveActionValue(action.value, valueCtx);
        const existing = target.statuses.find(s => s.type === action.status);
        if (existing) {
          existing.remainingDuration = action.duration;
          stampDeferredAppliedTurn(existing, currentTurnId);
        } else {
          const status: StatusEffect = {
            type: action.status,
            value,
            remainingDuration: action.duration,
          };
          stampDeferredAppliedTurn(status, currentTurnId);
          target.statuses.push(status);
        }
        ctx.addEffect({
          kind: LogEffectKind.apply_status,
          target: logTarget,
          status: action.status,
          duration: action.duration,
          value,
        });
        break;
      }
      case EffectId.stun: {
        const status: StatusEffect = {
          type: action.status,
          value: 0,
          remainingDuration: action.duration,
        };
        stampDeferredAppliedTurn(status, currentTurnId);
        target.statuses.push(status);
        ctx.addEffect({
          kind: LogEffectKind.apply_status,
          target: logTarget,
          status: action.status,
          duration: action.duration,
        });
        break;
      }
      default: {
        const value = action.value
          ? resolveActionValue(action.value, valueCtx)
          : 0;
        const status: StatusEffect = {
          type: action.status,
          value,
          remainingDuration: action.duration ?? Infinity,
        };
        stampDeferredAppliedTurn(status, currentTurnId);
        target.statuses.push(status);
        ctx.addEffect({
          kind: LogEffectKind.apply_status,
          target: logTarget,
          status: action.status,
          duration: action.duration ?? Infinity,
          value,
        } as LogEffect);
      }
    }
  }
}

function applyModifyStats(
  player: Player,
  actions: ModifyStatAction[],
  valueCtx: ValueContext,
  ctx: TurnContext = NO_CONTEXT,
  logTarget?: ActionTarget,
  currentTurnId = -1
): void {
  for (const action of actions) {
    const value = resolveActionValue(action.value, valueCtx);
    const status: StatusEffect = {
      type: action.stat,
      value,
      remainingDuration: (action.duration ?? Infinity) + 1,
    };
    stampDeferredAppliedTurn(status, currentTurnId);
    player.statuses.push(status);
    ctx.addEffect({
      kind: LogEffectKind.modify_stat,
      target: logTarget ?? action.target,
      stat: action.stat,
      value,
      duration: action.duration,
    });
  }
}

function decrementStatusDurations(player: Player, currentTurnId = -1): void {
  player.statuses = player.statuses.filter(s => {
    if (s.remainingDuration === undefined) return true;
    if (isSameTurnDeferred(s, currentTurnId)) return true;
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

  const valueCtx: ValueContext = {
    self: player,
    opponent: getOpponent(room, player.id),
  };

  const currentTurnId = room.steps.length;

  applyCleansing(player, cleanseActions, ctx);
  applyHealActions(player, healActions, valueCtx, ctx);

  applyStatusEffectsToSelf(
    player,
    applyStatusActions,
    valueCtx,
    ctx,
    currentTurnId
  );
  applyModifyStats(
    player,
    modifyStatActions,
    valueCtx,
    ctx,
    ActionTarget.self,
    currentTurnId
  );

  let dead: 'attacker' | 'defender' | null = null;

  if (skillTargetsOpponent(skill.actions)) {
    const opponent = getOpponent(room, player.id)!;

    applySkillToOpponent(player, opponent, skill.actions, ctx, currentTurnId);

    if (isDead(opponent)) {
      dead = 'defender';
    } else if (isDead(player)) {
      dead = 'attacker';
    }
  }

  processStatusEffects(player, ctx, currentTurnId);
  if (isDead(player)) {
    dead = 'attacker';
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

  decrementStatusDurations(player, currentTurnId);

  setNextTurn(room);

  return { dead: null };
}
