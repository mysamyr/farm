import {
  ActionTarget,
  ActionType,
  ApplyStatusAction,
  BASE_SKILLS,
  CleanseAction,
  CUSTOM_SKILLS,
  DamageAction,
  EffectId,
  type GameAction,
  HealAction,
  LifeStealAction,
  ModifyStatAction,
  type ReduceCooldownsAction,
  type Player,
  REQUIRED_ACTIVE_COUNT,
  REQUIRED_HEALING_COUNT,
  REQUIRED_PASSIVE_COUNT,
  type Room,
  type Skill,
  type SkillId,
  SKILLS,
  SkillType,
  StatId,
  type StatusEffect,
} from '../shared/index.js';

const STAT_TYPES: StatId[] = Object.values(StatId);

export type PlayerStats = Record<StatId, number>;

export function isStunned(player: Player): boolean {
  return player.statuses.some(
    s => s.type === EffectId.stun && s.remainingDuration! > 0
  );
}

/**
 * Get the minimum HP value of a player based on their statuses.
 * @param player The player whose minimum HP is being calculated.
 */
export function getPlayerMinHp(player: Player): number {
  return player.statuses.reduce((acc: number, status: StatusEffect) => {
    if (status.type === StatId.hp) acc -= status.value;
    return acc;
  }, 0);
}

export function getPlayerStats(player: Player): PlayerStats {
  const stats: PlayerStats = {
    hp: player.hp,
    armor: 0,
    attack: 0,
    crit: 0,
    dodge: 0,
  };

  for (const status of player.statuses) {
    if (STAT_TYPES.includes(status.type as StatId)) {
      stats[status.type as StatId] += status.value;
    }
  }

  return stats;
}

export function isPlayerResistant(player: Player): boolean {
  return player.statuses.some(
    s =>
      s.type === EffectId.resistance &&
      (s.remainingDuration === undefined || s.remainingDuration > 0)
  );
}

export function isPlayerReflecting(player: Player): boolean {
  return player.statuses.some(
    s =>
      s.type === EffectId.reflection &&
      (s.remainingDuration === undefined || s.remainingDuration > 0)
  );
}

export function isSameTurnDeferred(
  status: StatusEffect,
  currentTurnId: number
): boolean {
  return status.appliedTurn === currentTurnId;
}

export function stampDeferredAppliedTurn(
  status: StatusEffect,
  currentTurnId: number
): void {
  status.appliedTurn = currentTurnId;
}

export function getThorns(player: Player): number {
  return player.statuses.reduce((acc, s) => {
    if (
      s.type === EffectId.thorns &&
      (s.remainingDuration === undefined || s.remainingDuration > 0)
    ) {
      acc += s.value ?? 0;
    }
    return acc;
  }, 0);
}

export function getLeech(player: Player): number {
  return player.statuses.reduce((acc, s) => {
    if (
      s.type === EffectId.leech &&
      (s.remainingDuration === undefined || s.remainingDuration > 0)
    ) {
      acc += s.value ?? 0;
    }
    return acc;
  }, 0);
}

export function getPierce(player: Player): number {
  return player.statuses.reduce((acc, s) => {
    if (
      s.type === EffectId.pierce &&
      (s.remainingDuration === undefined || s.remainingDuration > 0)
    ) {
      acc += s.value ?? 0;
    }
    return acc;
  }, 0);
}

export function isValidSkillSelection(skills: SkillId[]): boolean {
  const uniqueSkills = new Set(skills);
  if (uniqueSkills.size !== skills.length) return false;

  const baseSkillIds = new Set(BASE_SKILLS);
  if (skills.some(id => baseSkillIds.has(id))) return false;

  if (!skills.every(id => CUSTOM_SKILLS.includes(id))) return false;

  const selectedSkillIds = skills
    .map(id => CUSTOM_SKILLS.find(s => s === id))
    .filter((skill): skill is SkillId => skill !== undefined);

  const selectedSkills = selectedSkillIds.map(id => SKILLS[id]);

  const activeCount = selectedSkills.filter(
    s => s.type === SkillType.active
  ).length;
  const healingCount = selectedSkills.filter(
    s => s.type === SkillType.healing
  ).length;
  const passiveCount = selectedSkills.filter(
    s => s.type === SkillType.passive
  ).length;

  return (
    activeCount === REQUIRED_ACTIVE_COUNT &&
    healingCount === REQUIRED_HEALING_COUNT &&
    passiveCount === REQUIRED_PASSIVE_COUNT
  );
}

export function getSkillById(id: SkillId): Skill | undefined {
  return SKILLS[id];
}

export function getActivePlayer(room: Room): Player | undefined {
  const playerId = room.order[room.turn];
  return room.players.find(p => p.id === playerId);
}

export function getOpponent(room: Room, playerId: string): Player | undefined {
  return room.players.find(p => p.id !== playerId);
}

export function skillTargetsOpponent(actions: GameAction[]): boolean {
  return actions.some(a => a.target === ActionTarget.opponent);
}

export function rollChance(percent: number): boolean {
  return Math.random() * 100 < percent;
}

export function calculateDamage(
  value: number,
  attack: number,
  armor: number,
  isCrit: boolean
): number {
  let damage = value + attack - armor;
  if (isCrit) damage *= 2;
  return Math.max(damage, 1);
}

export function isDead(player: Player): boolean {
  return getPlayerStats(player).hp <= 0;
}

export function splitOpponentActions(
  actions: GameAction[]
): [
  DamageAction[],
  LifeStealAction[],
  ApplyStatusAction[],
  ModifyStatAction[],
] {
  return actions.reduce<
    [DamageAction[], LifeStealAction[], ApplyStatusAction[], ModifyStatAction[]]
  >(
    (acc, action) => {
      if (
        action.target === ActionTarget.self &&
        action.type === ActionType.LIFE_STEAL
      )
        acc[1].push(action);
      if (action.target === ActionTarget.self) return acc;

      if (action.type === ActionType.DAMAGE) acc[0].push(action);
      if (action.type === ActionType.APPLY_STATUS) acc[2].push(action);
      if (action.type === ActionType.MODIFY_STAT) acc[3].push(action);

      return acc;
    },
    [[], [], [], []]
  );
}

export function splitSelfActions(
  actions: GameAction[]
): [
  ApplyStatusAction[],
  ModifyStatAction[],
  HealAction[],
  CleanseAction[],
  ReduceCooldownsAction[],
] {
  return actions.reduce<
    [
      ApplyStatusAction[],
      ModifyStatAction[],
      HealAction[],
      CleanseAction[],
      ReduceCooldownsAction[],
    ]
  >(
    (acc, action) => {
      if (action.target === ActionTarget.opponent) return acc;

      if (action.type === ActionType.APPLY_STATUS) acc[0].push(action);
      if (action.type === ActionType.MODIFY_STAT) acc[1].push(action);
      if (action.type === ActionType.HEAL) acc[2].push(action);
      if (action.type === ActionType.CLEANSE) acc[3].push(action);
      if (action.type === ActionType.REDUCE_COOLDOWNS) acc[4].push(action);
      return acc;
    },
    [[], [], [], [], []]
  );
}
