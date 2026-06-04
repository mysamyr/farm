import type { GameAction, Skill, StatType } from '@game/shared/types/arena';

export const STAT_LABELS: Record<StatType, string> = {
  hp: '❤️ HP',
  armor: '🛡️ Armor',
  attack: '⚔️ Attack',
  crit: '🎯 Crit',
  dodge: '💨 Evade',
};

// TODO: more ts types
export const SKILL_ICONS: Record<string, string> = {
  attack: '⚔️',
  skip: '⏭️',
  bleed_strike: '🗡️',
  viper_strike: '🐍',
  knockback: '💥',
  heal: '💚',
  regeneration: '🌿',
  magic_shield: '🛡️',
  vampiric_strike: '🧛',
  toughened: '🪨',
  plating: '⚙️',
  assassin: '🥷',
  strong: '💪',
  fanatic: '🔥',
  thorns: '🌵',
};

export const SKILL_NAMES: Record<string, string> = {
  attack: 'Attack',
  skip: 'Skip',
  bleed_strike: 'Bleed Strike',
  viper_strike: 'Viper Strike',
  knockback: 'Knockback',
  heal: 'Heal',
  regeneration: 'Regeneration',
  magic_shield: 'Magic Shield',
  vampiric_strike: 'Vampiric Strike',
  toughened: 'Toughened',
  plating: 'Plating',
  assassin: 'Assassin',
  strong: 'Strong',
  fanatic: 'Fanatic',
  thorns: 'Thorns',
};

export function getSkillIcon(skillId: string): string {
  return SKILL_ICONS[skillId] ?? '✨';
}

export function getSkillName(skillId: string): string {
  return SKILL_NAMES[skillId] ?? skillId.replace(/_/g, ' ');
}

function formatAction(action: GameAction): string {
  switch (action.type) {
    case 'DAMAGE':
      return `Deal ${action.value} damage`;
    case 'HEAL':
      return `Heal for ${action.value}`;
    case 'LIFESTEAL':
      return `Lifesteal ${action.value}% of damage`;
    case 'APPLY_STATUS': {
      const val = action.value !== undefined ? ` (${action.value})` : '';
      const dur =
        action.duration < 999 ? ` for ${action.duration} turns` : ' (passive)';
      return `Apply ${action.status}${val}${dur}`;
    }
    case 'MODIFY_STAT': {
      const sign = (action.value ?? 0) >= 0 ? '+' : '';
      return `${sign}${action.value ?? 0} ${STAT_LABELS[action.stat] ?? action.stat}`;
    }
  }
}

export function getSkillEffects(skill: Skill): string[] {
  return skill.actions.map(formatAction);
}
