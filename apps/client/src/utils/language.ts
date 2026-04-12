import { LOCAL_STORAGE_KEY } from '../constants';
import { LanguageCode } from '../constants/language';

export function getLanguage(): LanguageCode {
  return (
    (window.localStorage.getItem(LOCAL_STORAGE_KEY.LANGUAGE) as LanguageCode) ||
    LanguageCode.EN
  );
}

export function setLanguage(language: LanguageCode): void {
  window.localStorage.setItem(LOCAL_STORAGE_KEY.LANGUAGE, language);
}
