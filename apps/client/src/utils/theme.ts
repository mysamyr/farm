import type { GameColor } from '@game/shared/constants';

import { LOCAL_STORAGE_KEY } from '../constants/index.js';
import { Theme } from '../constants/theme.js';

export function getTheme(): Theme {
  return (
    (window.localStorage.getItem(LOCAL_STORAGE_KEY.THEME) as Theme) ||
    Theme.LIGHT
  );
}

export function setTheme(theme: Theme): void {
  window.localStorage.setItem(LOCAL_STORAGE_KEY.THEME, theme);
}

export function applyAccentColor(color: GameColor): void {
  document.documentElement.setAttribute('data-accent', color);
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
}
