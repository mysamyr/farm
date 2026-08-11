import {
  ActionTarget,
  BASE_SKILLS,
  CUSTOM_SKILLS,
  EffectId,
  type GameAction,
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

export function getPlayerMaxHp(player: Player): number {
  return player.statuses.reduce((acc: number, status: StatusEffect) => {
    if (status.type === StatId.hp) acc += status.value;
    return acc;
  }, 100);
}

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
