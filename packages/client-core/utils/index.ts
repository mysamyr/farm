import type { BaseRoom } from '@game/shared/types';

export function classNames(
  ...classes: (string | boolean | undefined)[]
): string {
  return classes.filter(Boolean).join(' ');
}

export function getOwnerName(room: BaseRoom): string {
  const owner = room.players.find(player => player.id === room.ownerId);
  return owner ? owner.name : 'Unknown';
}

/**
 * Simple string interpolation helper for translations.
 * Replaces {key} placeholders with values from params.
 *
 * @example
 * t("Deal {value} damage", { value: 10 }) // "Deal 10 damage"
 * t("Hello {name}!", { name: "World" }) // "Hello World!"
 */
export function t(
  template: string,
  params?: Record<string, string | number>
): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(params[key] ?? `{${key}}`)
  );
}

// Re-export from other utility files
export * from './identity.js';
export * from './language.js';
export * from './roomName/index.js';
export * from './theme.js';
export * from './validation.js';
