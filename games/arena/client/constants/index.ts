import {
  ActionTarget,
  ActionType,
  ActionValueSource,
  EffectId,
  GameAction,
  type ReactiveActionValue,
  Skill,
  SkillId,
  SkillType,
  StatId,
} from '@game/game-arena/shared';

import type {
  ArenaSkillEffectLabelsTranslation,
  ArenaSkillNamesTranslation,
  ArenaStatLabelsTranslation,
  ArenaEffectLabelsTranslation,
  UtilTranslation,
} from '../i18n/index.js';

// ─── Skill icons (visual only, not translatable) ─────────
export const SKILL_ICONS: Record<SkillId, string> = {
  attack: '⚔️',
  skip: '⏭️',
  bleed_strike: '🔪',
  viper_strike: '🐍',
  knockback: '💥',
  corrosion: '🛡️',
  heal: '💚',
  regeneration: '🌿',
  resistance: '🫧',
  cleanse: '✨',
  meditation: '🧘',
  rage: '😡',
  spiked_armor: '✴️',
  reflect: '🪞',
  vampiric_strike: '🧛',
  bash_strike: '🔨',
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

export const EFFECT_ICONS: Record<EffectId, string> = {
  poison: '☠️',
  bleed: '🩸',
  stun: '💫',
  regeneration: '💚',
  resistance: '🔰',
  thorns: '🌵',
  leech: '🧛',
  pierce: '🗡️',
  reflection: '🪞',
};

export function getEffectIcon(effectId: EffectId): string {
  return EFFECT_ICONS[effectId] ?? '✨';
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

function formatActionValue(
  value: ReactiveActionValue,
  labels: ArenaSkillEffectLabelsTranslation,
  statLabels: ArenaStatLabelsTranslation,
  util: UtilTranslation
): string {
  switch (value.source) {
    case ActionValueSource.raw:
      return String(value.amount);
    case ActionValueSource.currentHp:
      return labels.valueCurrentHp
        .replace('{percent}', String(value.percent))
        .replace(
          '{actor}',
          value.actor === ActionTarget.self ? util.self : util.opponent
        );
    case ActionValueSource.maxHp:
      return labels.valueMaxHp
        .replace('{percent}', String(value.percent))
        .replace(
          '{actor}',
          value.actor === ActionTarget.self ? util.self : util.opponent
        );
    case ActionValueSource.stat:
      return labels.valueStat
        .replace('{percent}', String(value.percent))
        .replace(
          '{actor}',
          value.actor === ActionTarget.self ? util.self : util.opponent
        )
        .replace('{stat}', getStatLabel(value.stat, statLabels));
    case ActionValueSource.damageDealt:
      return labels.valueDamageDealt.replace(
        '{percent}',
        String(value.percent)
      );
  }
}

function getValueCoefficient(value: ReactiveActionValue): number {
  return value.source === ActionValueSource.raw ? value.amount : value.percent;
}

function formatDuration(
  duration: number | undefined,
  labels: ArenaSkillEffectLabelsTranslation
): string {
  return duration
    ? ` ${labels.durationTurns.replace('{turns}', String(duration))}`
    : ` ${labels.durationPassive}`;
}

function formatAction(
  action: GameAction,
  labels: ArenaSkillEffectLabelsTranslation,
  statLabels: ArenaStatLabelsTranslation,
  effectLabels: ArenaEffectLabelsTranslation,
  util: UtilTranslation
): string {
  switch (action.type) {
    case ActionType.DAMAGE:
      return labels.damage.replace(
        '{value}',
        formatActionValue(action.value, labels, statLabels, util)
      );
    case ActionType.HEAL:
      return labels.heal.replace(
        '{value}',
        formatActionValue(action.value, labels, statLabels, util)
      );
    case ActionType.LIFE_STEAL:
      return labels.lifesteal.replace(
        '{value}',
        formatActionValue(action.value, labels, statLabels, util)
      );
    case ActionType.CLEANSE:
      return labels.cleanse;
    case ActionType.REDUCE_COOLDOWNS:
      return labels.reduceCooldowns.replace('{amount}', String(action.amount));
    case ActionType.APPLY_STATUS: {
      const val =
        action.value !== undefined
          ? ` (${formatActionValue(action.value, labels, statLabels, util)})`
          : '';
      return labels.applyStatus
        .replace('{status}', effectLabels[action.status])
        .replace('{value}', val)
        .replace(
          '{target}',
          action.target === ActionTarget.self ? util.self : util.opponent
        )
        .replace('{duration}', formatDuration(action.duration, labels));
    }
    case ActionType.MODIFY_STAT: {
      const sign = getValueCoefficient(action.value) >= 0 ? '+' : '';
      return labels.modifyStat
        .replace('{sign}', sign)
        .replace(
          '{value}',
          formatActionValue(action.value, labels, statLabels, util)
        )
        .replace('{stat}', getStatLabel(action.stat, statLabels))
        .replace(
          '{target}',
          action.target === ActionTarget.self ? util.self : util.opponent
        )
        .replace('{duration}', formatDuration(action.duration, labels));
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
  statLabels: ArenaStatLabelsTranslation,
  effectLabels: ArenaEffectLabelsTranslation,
  util: UtilTranslation
): string[] {
  if (skill.actions.length === 0) {
    return [labels.noEffects];
  }
  return skill.actions.map(a =>
    formatAction(a, labels, statLabels, effectLabels, util)
  );
}
