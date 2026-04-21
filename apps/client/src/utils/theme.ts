import { DEFAULT_THEME, LOCAL_STORAGE_KEY, type ThemeCode } from '../constants';

export function getTheme(): ThemeCode {
  return (
    (window.localStorage.getItem(LOCAL_STORAGE_KEY.THEME) as ThemeCode) ||
    DEFAULT_THEME
  );
}

export function setTheme(theme: ThemeCode): void {
  window.localStorage.setItem(LOCAL_STORAGE_KEY.THEME, theme);
}
