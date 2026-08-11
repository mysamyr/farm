import {
  ActionType,
  GameAction,
  Skill,
  SkillId,
  SkillType,
  StatId,
} from '@game/game-arena/shared';

import type {
  ArenaSkillEffectLabelsTranslation,
  ArenaSkillNamesTranslation,
  ArenaStatLabelsTranslation,
} from '../i18n/index.js';

// ─── Skill icons (visual only, not translatable) ─────────
export const SKILL_ICONS: Record<SkillId, string> = {
  attack: '⚔️',
  skip: '⏭️',
  bleed_strike: '🔪',
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
  pierce: '🗡️',
};

export function getSkillIcon(skillId: SkillId): string {
  return SKILL_ICONS[skillId] ?? '✨';
}

export function getSkillName(
  skillId: SkillId,
  skillNames: ArenaSkillNamesTranslation
): string {
  return skillNames[skillId] ?? skillId.replace(/_/g, ' ');
}

export function getStatLabel(
  stat: StatId,
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
    case ActionType.DAMAGE:
      return labels.damage.replace('{value}', String(action.value));
    case ActionType.HEAL:
      return labels.heal.replace('{value}', String(action.value));
    case ActionType.LIFE_STEAL:
      return labels.lifesteal.replace('{value}', String(action.value));
    case ActionType.CLEANSE:
      return labels.cleanse;
    case ActionType.APPLY_STATUS: {
      const val = action.value !== undefined ? ` (${action.value})` : '';
      const dur = action.duration
        ? ` ${labels.durationTurns.replace('{turns}', String(action.duration))}`
        : ` ${labels.durationPassive}`;
      return labels.applyStatus
        .replace('{status}', action.status)
        .replace('{value}', val)
        .replace('{duration}', dur);
    }
    case ActionType.MODIFY_STAT: {
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
  if (skill.type === SkillType.active || skill.type === SkillType.healing) {
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
