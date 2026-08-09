// Arena Game - Server Types
import type { LogEffect } from '../shared';

export interface TurnContext {
  addEffect(effect: LogEffect): void;
}
