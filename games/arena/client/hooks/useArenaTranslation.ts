import { useLanguage } from '@game/client-core/hooks';

import {
  type ArenaHelpTranslation,
  type ArenaTranslation,
  getArenaTranslations,
} from '../i18n/index.js';

export type {
  ArenaBattleLogTranslation,
  ArenaFightTranslation,
  ArenaHelpTranslation,
  ArenaPreparationTranslation,
  ArenaSkillEffectLabelsTranslation,
  ArenaSkillNamesTranslation,
  ArenaStatLabelsTranslation,
  ArenaTranslation,
} from '../i18n/index.js';

export function useArenaTranslation(): ArenaTranslation {
  const { language } = useLanguage();
  return getArenaTranslations(language).game;
}

export function useArenaHelpTranslation(): ArenaHelpTranslation {
  const { language } = useLanguage();
  return getArenaTranslations(language).help;
}
