import { ERROR } from '@game/shared/constants';

import { LOCAL_STORAGE_KEY } from '../constants/index.js';
import { DEFAULT_LANGUAGE, LanguageCode } from '../constants/language.js';

import type { Translation } from '../types/index.js';

function isLanguageCode(value: string | null): value is LanguageCode {
  return (
    value !== null &&
    Object.values(LanguageCode).includes(value as LanguageCode)
  );
}

export function getLanguage(): LanguageCode {
  const storedLanguage = window.localStorage.getItem(
    LOCAL_STORAGE_KEY.LANGUAGE
  );
  if (!isLanguageCode(storedLanguage)) {
    setLanguage(DEFAULT_LANGUAGE);
    return DEFAULT_LANGUAGE;
  }

  return storedLanguage;
}

export function setLanguage(language: LanguageCode): void {
  window.localStorage.setItem(LOCAL_STORAGE_KEY.LANGUAGE, language);
}

export function resolveErrorMessage(
  error: string | ERROR | undefined,
  translation: Translation
): string {
  if (!error) return '';

  if (typeof error === 'string' && error in ERROR) {
    const enumValue = ERROR[error as keyof typeof ERROR];
    if (typeof enumValue === 'string') {
      return translation.errors[enumValue] || error;
    }
  }

  return error;
}
