export function classNames(
  ...classes: (string | boolean | undefined)[]
): string {
  return classes.filter(Boolean).join(' ');
}

export function noop(): void {}

export * from './identity.js';
export * from './language.js';
export * from './overlay.js';
