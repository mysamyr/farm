/**
 * Arena game i18n module
 */
import type { LanguageCode } from '@game/client-core/constants';

import * as en from './en';
import type { ArenaHelpTranslation, ArenaTranslation } from './types';
import * as ua from './ua';

export type {
  ArenaBattleLogTranslation,
  ArenaFightTranslation,
  ArenaHelpTranslation,
  ArenaPreparationTranslation,
  ArenaSkillEffectLabelsTranslation,
  ArenaSkillNamesTranslation,
  ArenaStatLabelsTranslation,
  ArenaTranslation,
} from './types';

const translations: Record<
  LanguageCode,
  { game: ArenaTranslation; help: ArenaHelpTranslation }
> = {
  en: { game: en.arenaGameTranslation, help: en.arenaHelpTranslation },
  ua: { game: ua.arenaGameTranslation, help: ua.arenaHelpTranslation },
};

export function getArenaTranslations(lang: LanguageCode): {
  game: ArenaTranslation;
  help: ArenaHelpTranslation;
} {
  return translations[lang] ?? translations.en;
}
