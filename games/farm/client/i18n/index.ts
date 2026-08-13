import type { LanguageCode } from '@game/client-core/constants';

import * as en from './en.js';
import type { FarmHelpTranslation, FarmTranslation } from './types.js';
import * as ua from './ua.js';

export type * from './types.js';

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
