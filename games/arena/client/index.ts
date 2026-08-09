import type { GameConfig } from '@game/client-core/types';

import ArenaHelpModal from './components/ArenaHelpModal.js';
import { useGameSubscriptions } from './hooks/useGameSubscriptions.js';
import Gameboard from './pages/Gameboard/index.js';

export const arenaConfig: GameConfig = {
  id: 'arena',
  maxPlayers: 2,
  minPlayers: 2,
  color: 'blue',
  emoji: '⚔️',
  rules: [],
  GameboardPage: Gameboard,
  HelpModal: ArenaHelpModal,
  useGameSubscriptions,
};
