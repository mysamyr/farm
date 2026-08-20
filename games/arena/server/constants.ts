import type { TurnContext } from './types.js';

export const TURN_START_INDEX = 0 as const;

export const NO_CONTEXT: TurnContext = { addEffect: () => {} };
