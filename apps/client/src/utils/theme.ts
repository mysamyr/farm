import { LOCAL_STORAGE_KEY } from '../constants';
import { DEFAULT_THEME, type ThemeCode } from '../constants/theme';

export function getTheme(): ThemeCode {
  return (
    (window.localStorage.getItem(LOCAL_STORAGE_KEY.THEME) as ThemeCode) ||
    DEFAULT_THEME
  );
}

export function setTheme(theme: ThemeCode): void {
  window.localStorage.setItem(LOCAL_STORAGE_KEY.THEME, theme);
}
