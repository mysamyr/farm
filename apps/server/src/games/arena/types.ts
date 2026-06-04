import type { LogEffect } from '@game/shared/types/arena';

export interface TurnContext {
  addEffect(effect: LogEffect): void;
}
