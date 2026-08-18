import { SkillId, StatId, EffectId, GAME_RULES } from '../../shared/index.js';

export type ArenaStatLabelsTranslation = Record<StatId, string>;

export type ArenaEffectLabelsTranslation = Record<EffectId, string>;

export type ArenaSkillNamesTranslation = Record<SkillId, string>;

export interface ArenaSkillEffectLabelsTranslation {
  damage: string;
  heal: string;
  lifesteal: string;
  applyStatus: string;
  modifyStat: string;
  cleanse: string;
  durationTurns: string;
  durationPassive: string;
  cooldown: string;
  noEffects: string;
  valueCurrentHp: string;
  valueMaxHp: string;
  valueStat: string;
  valueDamageDealt: string;
}

export interface ArenaPreparationTranslation {
  activeSkillsLabel: string;
  healingSkillsLabel: string;
  passiveSkillsLabel: string;
  activeSkillsFull: string;
  healingSkillFull: string;
  passiveSkillsFull: string;
  waitingForOpponent: string;
  failedToReady: string;
  readyButton: string;
  resetButton: string;
  victoryTitle: string;
  victoryMessage: string;
  opponentLeftTitle: string;
  opponentLeftMessage: string;
}

export interface ArenaFightTranslation {
  yourSkillsLabel: string;
  opponentTurnBadge: string;
  gameOverBadge: string;
  failedToUseSkill: string;
  turnBadge: string;
  winnerBadge: string;
}

export interface ArenaBattleLogTranslation {
  title: string;
  noActionsYet: string;
  turnLabel: string;
  used: string;
  damage: string;
  crit: string;
  dodge: string;
  heal: string;
  lifesteal: string;
  bleed: string;
  poison: string;
  regeneration: string;
  thorns: string;
  leech: string;
  cleanse: string;
  resist: string;
  applyStatus: string;
  modifyStat: string;
  durationTurns: string;
}

export type ArenaRuleLabelsTranslation = Record<GAME_RULES, string>;

export interface UtilTranslation {
  self: string;
  opponent: string;
}

export interface ArenaTranslation {
  name: string;
  shortDescription: string;
  statLabels: ArenaStatLabelsTranslation;
  effectLabels: ArenaEffectLabelsTranslation;
  skillNames: ArenaSkillNamesTranslation;
  skillEffectLabels: ArenaSkillEffectLabelsTranslation;
  skillInfoLabel: string;
  preparation: ArenaPreparationTranslation;
  fight: ArenaFightTranslation;
  battleLog: ArenaBattleLogTranslation;
  ruleLabels: ArenaRuleLabelsTranslation;
  util: UtilTranslation;
}

export type ArenaHelpStatDescriptions = Record<StatId, string>;

export type ArenaHelpEffectDescriptions = Record<EffectId, string>;

export interface ArenaHelpTranslation {
  title: string;
  goal: string;
  statsHeader: string;
  statsIntro: string;
  stats: ArenaHelpStatDescriptions;
  skillsHeader: string;
  skillsIntro: string;
  activeSkills: string;
  healingSkills: string;
  passiveSkills: string;
  effectsHeader: string;
  effectsIntro: string;
  effects: ArenaHelpEffectDescriptions;
  turnHeader: string;
  turnIntro: string;
  turnSteps: string[];
}
