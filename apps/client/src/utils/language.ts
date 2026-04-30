import { ERROR } from '@game/shared/constants';

import { LOCAL_STORAGE_KEY } from '../constants';
import { DEFAULT_LANGUAGE, LanguageCode } from '../constants/language';

import type { Translation } from '../types/language';

export function getLanguage(): LanguageCode {
  return (
    (window.localStorage.getItem(LOCAL_STORAGE_KEY.LANGUAGE) as LanguageCode) ||
    DEFAULT_LANGUAGE
  );
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
