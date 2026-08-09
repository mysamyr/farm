import type { LogEffect } from '../shared/index.js';

export interface TurnContext {
  addEffect(effect: LogEffect): void;
}
