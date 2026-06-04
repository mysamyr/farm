import { DEFAULT_CONFIG } from '@game/shared/constants/arena';

import type { GameConfig } from '../types';

import ArenaHelpModal from './components/ArenaHelpModal';
import { useGameSubscriptions } from './hooks/useGameSubscriptions';
import Gameboard from './pages/Gameboard';

export const arenaConfig: GameConfig = {
  id: 'arena',
  maxPlayers: DEFAULT_CONFIG.maxPlayers,
  minPlayers: DEFAULT_CONFIG.minPlayers,
  color: 'blue',
  emoji: '⚔️',
  rules: [],
  GameboardPage: Gameboard,
  HelpModal: ArenaHelpModal,
  useGameSubscriptions,
};
