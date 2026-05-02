import { ERROR } from '@game/shared/constants';

import { LOCAL_STORAGE_KEY } from '../constants';
import { DEFAULT_LANGUAGE, LanguageCode } from '../constants/language';

import type { Translation } from '../types/language';

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

  // If the error is a known ERROR enum value, return the corresponding translation
  if (typeof error === 'number') {
    return translation.errors[error] || `Unknown error: ${error}`;
  }

  return error;
}
