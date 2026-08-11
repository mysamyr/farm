import { SkillId, StatId } from '../../shared/index.js';

export type ArenaStatLabelsTranslation = Record<StatId, string>;

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
  clearButton: string;
  victoryTitle: string;
  victoryMessage: string;
  opponentLeftTitle: string;
  opponentLeftMessage: string;
  equipButton: string;
  unequipButton: string;
  closeButton: string;
}

export interface ArenaFightTranslation {
  yourSkillsLabel: string;
  opponentTurnBadge: string;
  gameOverBadge: string;
  failedToUseSkill: string;
  useButton: string;
  closeButton: string;
  turnBadge: string;
  winnerBadge: string;
}

export interface ArenaBattleLogTranslation {
  title: string;
  noActionsYet: string;
  turnLabel: string;
  used: string;
}

export interface ArenaTranslation {
  name: string;
  statLabels: ArenaStatLabelsTranslation;
  skillNames: ArenaSkillNamesTranslation;
  skillEffectLabels: ArenaSkillEffectLabelsTranslation;
  preparation: ArenaPreparationTranslation;
  fight: ArenaFightTranslation;
  battleLog: ArenaBattleLogTranslation;
}

// Arena help is empty for now but uses Record type to pass lint
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ArenaHelpTranslation {} // TODO: Add Arena help
