export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

export type ThemeCode = (typeof THEME)[keyof typeof THEME];

export const DEFAULT_THEME: ThemeCode = THEME.LIGHT;

export const ACCENT_COLOR = {
  PURPLE: 'purple',
  ORANGE: 'orange',
  BLUE: 'blue',
  TEAL: 'teal',
} as const;

export type AccentColor = (typeof ACCENT_COLOR)[keyof typeof ACCENT_COLOR];
