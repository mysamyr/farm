/**
 * Farm game i18n module
 */
import type { LanguageCode } from '@game/client-core/constants';

import * as en from './en';
import type { FarmHelpTranslation, FarmTranslation } from './types';
import * as ua from './ua';

export type {
  FarmHelpTranslation,
  FarmTranslation,
  FarmTradeTranslation,
} from './types';

const translations: Record<
  LanguageCode,
  { game: FarmTranslation; help: FarmHelpTranslation }
> = {
  en: { game: en.farmGameTranslation, help: en.farmHelpTranslation },
  ua: { game: ua.farmGameTranslation, help: ua.farmHelpTranslation },
};

export function getFarmTranslations(lang: LanguageCode): {
  game: FarmTranslation;
  help: FarmHelpTranslation;
} {
  return translations[lang] ?? translations.en;
}
