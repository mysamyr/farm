import type { GameAction, Skill, StatType } from '@game/shared/types/arena';

import type {
  ArenaSkillNamesTranslation,
  ArenaSkillEffectLabelsTranslation,
  ArenaStatLabelsTranslation,
} from '../hooks/useArenaTranslation';

// ─── Skill icons (visual only, not translatable) ─────────
export const SKILL_ICONS: Record<string, string> = {
  attack: '⚔️',
  skip: '⏭️',
  bleed_strike: '🗡️',
  viper_strike: '🐍',
  knockback: '💥',
  heal: '💚',
  regeneration: '🌿',
  magic_shield: '🛡️',
  cleanse: '✨',
  vampiric_strike: '🧛',
  toughened: '🪨',
  plating: '⚙️',
  assassin: '🥷',
  strong: '💪',
  fanatic: '🔥',
  thorns: '🌵',
  leech: '🩸',
};

export function getSkillIcon(skillId: string): string {
  return SKILL_ICONS[skillId] ?? '✨';
}

export function getSkillName(
  skillId: string,
  skillNames: ArenaSkillNamesTranslation
): string {
  return skillNames[skillId] ?? skillId.replace(/_/g, ' ');
}

export function getStatLabel(
  stat: StatType,
  statLabels: ArenaStatLabelsTranslation
): string {
  return statLabels[stat] ?? stat;
}

function formatAction(
  action: GameAction,
  labels: ArenaSkillEffectLabelsTranslation,
  statLabels: ArenaStatLabelsTranslation
): string {
  switch (action.type) {
    case 'DAMAGE':
      return labels.damage.replace('{value}', String(action.value));
    case 'HEAL':
      return labels.heal.replace('{value}', String(action.value));
    case 'LIFESTEAL':
      return labels.lifesteal.replace('{value}', String(action.value));
    case 'CLEANSE':
      return labels.cleanse;
    case 'APPLY_STATUS': {
      const val = action.value !== undefined ? ` (${action.value})` : '';
      const dur =
        action.duration < 999
          ? ` ${labels.durationTurns.replace('{turns}', String(action.duration))}`
          : ` ${labels.durationPassive}`;
      return labels.applyStatus
        .replace('{status}', action.status)
        .replace('{value}', val)
        .replace('{duration}', dur);
    }
    case 'MODIFY_STAT': {
      const sign = (action.value ?? 0) >= 0 ? '+' : '';
      return labels.modifyStat
        .replace('{sign}', sign)
        .replace('{value}', String(action.value ?? 0))
        .replace('{stat}', getStatLabel(action.stat, statLabels));
    }
  }
}

export function getSkillCooldownText(
  skill: Skill,
  labels: ArenaSkillEffectLabelsTranslation
): string | null {
  if (skill.type === 'active' || skill.type === 'healing') {
    return labels.cooldown.replace('{cooldown}', String(skill.cooldown));
  }
  return null;
}

export function getSkillEffects(
  skill: Skill,
  labels: ArenaSkillEffectLabelsTranslation,
  statLabels: ArenaStatLabelsTranslation
): string[] {
  return skill.actions.map(a => formatAction(a, labels, statLabels));
}
