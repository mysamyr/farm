import { useLanguage } from '@game/client-core/hooks';

import {
  type FarmHelpTranslation,
  type FarmTranslation,
  getFarmTranslations,
} from '../i18n/index.js';

export type {
  FarmHelpTranslation,
  FarmTranslation,
  FarmTradeTranslation,
} from '../i18n/index.js';

export function useFarmTranslation(): FarmTranslation {
  const { language } = useLanguage();
  return getFarmTranslations(language).game;
}

export function useFarmHelpTranslation(): FarmHelpTranslation {
  const { language } = useLanguage();
  return getFarmTranslations(language).help;
}
