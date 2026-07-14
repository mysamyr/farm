import { useLanguage } from '../../../hooks/useLanguage';

export interface ArenaSkillNamesTranslation {
  attack: string;
  skip: string;
  bleed_strike: string;
  viper_strike: string;
  knockback: string;
  heal: string;
  regeneration: string;
  magic_shield: string;
  cleanse: string;
  vampiric_strike: string;
  toughened: string;
  plating: string;
  assassin: string;
  strong: string;
  fanatic: string;
  thorns: string;
  leech: string;
  [key: string]: string;
}

export interface ArenaStatLabelsTranslation {
  hp: string;
  armor: string;
  attack: string;
  crit: string;
  dodge: string;
}

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
  statLabels: ArenaStatLabelsTranslation;
  skillNames: ArenaSkillNamesTranslation;
  skillEffectLabels: ArenaSkillEffectLabelsTranslation;
  preparation: ArenaPreparationTranslation;
  fight: ArenaFightTranslation;
  battleLog: ArenaBattleLogTranslation;
}

export function useArenaTranslation(): ArenaTranslation {
  const { translation } = useLanguage();
  return translation.game.arena;
}
