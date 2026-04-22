import { ANIMALS } from '@game/shared/constants/farm';

export const LOCAL_STORAGE_KEY = {
  LANGUAGE: 'farm:language',
  USERNAME: 'farm:username',
  THEME: 'farm:theme',
  USER_ID: 'farm:userId',
  CURRENT_ROOM_ID: 'farm:currentRoomId',
} as const;

export const PATHS = {
  DASHBOARD: '/',
  GAME_BOARD: '/game',
} as const;

export const ANIMALS_ICONS_CONFIG: Record<
  ANIMALS,
  Record<'label' | 'icon', string>
> = {
  [ANIMALS.DUCK]: { label: 'Duck', icon: '🦆' },
  [ANIMALS.GOAT]: { label: 'Goat', icon: '🐐' },
  [ANIMALS.PIG]: { label: 'Pig', icon: '🐖' },
  [ANIMALS.HORSE]: { label: 'Horse', icon: '🐎' },
  [ANIMALS.COW]: { label: 'Cow', icon: '🐄' },
  [ANIMALS.FOX]: { label: 'Fox', icon: '🦊' },
  [ANIMALS.BEAR]: { label: 'Bear', icon: '🐻' },
  [ANIMALS.SMALL_DOG]: { label: 'Sm. Dog', icon: '🐕' },
  [ANIMALS.BIG_DOG]: { label: 'Big Dog', icon: '🐕‍🦺' },
};

export const BUTTON_VARIANT = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  DANGER: 'danger',
  SUCCESS: 'success',
  ICON: 'icon',
} as const;

export type ButtonVariant =
  (typeof BUTTON_VARIANT)[keyof typeof BUTTON_VARIANT];

export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

export type ThemeCode = (typeof THEME)[keyof typeof THEME];

export const DEFAULT_THEME: ThemeCode = THEME.LIGHT;
