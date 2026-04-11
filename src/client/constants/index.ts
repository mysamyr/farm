import { ANIMALS } from '@shared/constants/farm';

export const LOCAL_STORAGE_KEY = {
  LANGUAGE: 'farm:language',
  USERNAME: 'farm:username',
};

export const SELECTORS = {
  inputs: {
    userName: 'username',
    roomName: 'room-name-input',
  },
  containers: {
    roomsList: 'rooms-list',
    currentRoom: 'panel-card',
    languageDropdown: 'language-dropdown',
  },
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
  [ANIMALS.FOX]: { label: 'Big Dog', icon: '🦊' },
  [ANIMALS.BEAR]: { label: 'Big Dog', icon: '🐻' },
  [ANIMALS.SMALL_DOG]: { label: 'Sm. Dog', icon: '🐕' },
  [ANIMALS.BIG_DOG]: { label: 'Big Dog', icon: '🐕‍🦺' },
};
