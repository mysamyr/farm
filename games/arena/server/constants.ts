// Arena Game - Server Constants
import type { TurnContext } from './types';

export const TURN_START_INDEX = 0 as const;

export const NO_CONTEXT: TurnContext = { addEffect: () => {} };
