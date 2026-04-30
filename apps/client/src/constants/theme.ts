export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

export type ThemeCode = (typeof THEME)[keyof typeof THEME];

export const DEFAULT_THEME: ThemeCode = THEME.LIGHT;
