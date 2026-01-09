import { Div } from '../components';
import { LOCAL_STORAGE_KEY, SELECTORS } from '../constants';
import language, {
  LanguageCode,
  LANGUAGES_CONFIG,
} from '../constants/language';
import { getValue, setValue } from '../utils/local-storage';

import type { Language, Translation } from '../types/language';

const getLanguage = (): LanguageCode =>
  (getValue(LOCAL_STORAGE_KEY.LANGUAGE) as LanguageCode) || LanguageCode.EN;

const setLanguage = (lang: LanguageCode): void => {
  setValue(LOCAL_STORAGE_KEY.LANGUAGE, lang);
};

export function getLanguageConfig(): Translation {
  return language[getLanguage()];
}

export const renderLanguageDropdown = (e: Event): void => {
  const existing: HTMLElement | null = document.getElementById(
    SELECTORS.containers.languageDropdown
  );
  if (existing) {
    existing.remove();
    return;
  }
  const anchor: HTMLDivElement = e.target as HTMLDivElement;

  const dropdown: HTMLDivElement = Div({
    id: 'language-dropdown',
  });
  dropdown.style.top = `${anchor.offsetTop + anchor.offsetHeight}px`;
  dropdown.style.left = `${anchor.offsetLeft}px`;

  LANGUAGES_CONFIG.forEach((lang: Language): void => {
    const option: HTMLDivElement = Div({
      className: 'language-option',
      text: lang.name,
      onClick: (): void => {
        if (lang.code !== getLanguage()) {
          setLanguage(lang.code);
          location.reload();
        }
        dropdown.remove();
      },
    });
    dropdown.appendChild(option);
  });

  document.body.appendChild(dropdown);

  setTimeout((): void => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (!dropdown.contains(e.target as Node) && e.target !== anchor) {
        dropdown.remove();
        document.removeEventListener('mousedown', handleClickOutside);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
  }, 0);
};
