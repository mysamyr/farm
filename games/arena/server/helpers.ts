// Arena Game - Pure Helper Functions
import {
  BASE_SKILLS,
  type GameAction,
  type Player,
  REQUIRED_ACTIVE_COUNT,
  REQUIRED_HEALING_COUNT,
  REQUIRED_PASSIVE_COUNT,
  type Room,
  type Skill,
  type SkillId,
  SKILLS,
  type StatType,
  type StatusEffect,
} from '../shared';

const STAT_TYPES: StatType[] = ['hp', 'armor', 'attack', 'crit', 'dodge'];

export type PlayerStats = Record<StatType, number>;

export function isStunned(player: Player): boolean {
  return player.statuses.some(
    s => s.type === 'stun' && s.remainingDuration > 0
  );
}

export function getPlayerMaxHp(player: Player): number {
  return player.statuses.reduce((acc: number, status: StatusEffect) => {
    if (status.type === 'hp') acc += status.value;
    return acc;
  }, 100);
}

export function getPlayerMinHp(player: Player): number {
  return player.statuses.reduce((acc: number, status: StatusEffect) => {
    if (status.type === 'hp') acc -= status.value;
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
    if (STAT_TYPES.includes(status.type as StatType)) {
      stats[status.type as StatType] += status.value;
    }
  }

  return stats;
}

export function isPlayerResistant(player: Player): boolean {
  return player.statuses.some(
    s => s.type === 'resistance' && (s.permanent || s.remainingDuration > 0)
  );
}

export function getThorns(player: Player): number {
  return player.statuses.reduce((acc, s) => {
    if (s.type === 'thorns' && (s.permanent || s.remainingDuration > 0)) {
      acc += s.value ?? 0;
    }
    return acc;
  }, 0);
}

export function getLeech(player: Player): number {
  return player.statuses.reduce((acc, s) => {
    if (s.type === 'leech' && (s.permanent || s.remainingDuration > 0)) {
      acc += s.value ?? 0;
    }
    return acc;
  }, 0);
}

export function isValidSkillSelection(skills: SkillId[]): boolean {
  const uniqueSkills = new Set(skills);
  if (uniqueSkills.size !== skills.length) return false;

  const baseSkillIds = new Set(BASE_SKILLS.map(s => s.id));
  if (skills.some(id => baseSkillIds.has(id))) return false;

  const selectableSkills = SKILLS.filter(s => !baseSkillIds.has(s.id));
  const validIds = new Set(selectableSkills.map(s => s.id));
  if (!skills.every(id => validIds.has(id))) return false;

  const selectedSkills = skills
    .map(id => selectableSkills.find(s => s.id === id))
    .filter((skill): skill is Skill => skill !== undefined);

  const activeCount = selectedSkills.filter(s => s.type === 'active').length;
  const healingCount = selectedSkills.filter(s => s.type === 'healing').length;
  const passiveCount = selectedSkills.filter(s => s.type === 'passive').length;

  return (
    activeCount === REQUIRED_ACTIVE_COUNT &&
    healingCount === REQUIRED_HEALING_COUNT &&
    passiveCount === REQUIRED_PASSIVE_COUNT
  );
}

export function canStartArenaGame(_room: Room): boolean {
  const baseSkillIds = new Set(BASE_SKILLS.map(s => s.id));
  const selectableSkills = SKILLS.filter(s => !baseSkillIds.has(s.id));

  const activeCount = selectableSkills.filter(s => s.type === 'active').length;
  const healingCount = selectableSkills.filter(
    s => s.type === 'healing'
  ).length;
  const passiveCount = selectableSkills.filter(
    s => s.type === 'passive'
  ).length;

  return (
    activeCount >= REQUIRED_ACTIVE_COUNT &&
    healingCount >= REQUIRED_HEALING_COUNT &&
    passiveCount >= REQUIRED_PASSIVE_COUNT
  );
}

export function getSkillById(id: SkillId): Skill | undefined {
  return SKILLS.find(s => s.id === id);
}

export function getActivePlayer(room: Room): Player | undefined {
  const playerId = room.order[room.turn];
  return room.players.find(p => p.id === playerId);
}

export function getOpponent(room: Room, playerId: string): Player | undefined {
  return room.players.find(p => p.id !== playerId);
}

export function skillTargetsOpponent(actions: GameAction[]): boolean {
  return actions.some(a => a.target === 'opponent');
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
