import { LOCAL_STORAGE_KEY } from '../constants/index.js';
import {
  DEFAULT_THEME,
  type AccentColor,
  type ThemeCode,
} from '../constants/theme.js';

export function getTheme(): ThemeCode {
  return (
    (window.localStorage.getItem(LOCAL_STORAGE_KEY.THEME) as ThemeCode) ||
    DEFAULT_THEME
  );
}

export function setTheme(theme: ThemeCode): void {
  window.localStorage.setItem(LOCAL_STORAGE_KEY.THEME, theme);
}

export function applyAccentColor(color: AccentColor): void {
  document.documentElement.setAttribute('data-accent', color);
}
