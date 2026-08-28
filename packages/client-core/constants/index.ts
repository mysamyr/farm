export const LOCAL_STORAGE_KEY = {
  LANGUAGE: 'farm:language',
  USERNAME: 'farm:username',
  USER_ID: 'farm:userId',
} as const;

export enum ButtonVariant {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  DANGER = 'danger',
  SUCCESS = 'success',
  ICON = 'icon',
  TEXT = 'text',
}

export * from './language.js';
export * from './events.js';
