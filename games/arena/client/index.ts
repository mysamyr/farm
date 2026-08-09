import type { GameConfig } from '@game/client-core/types';

import ArenaHelpModal from './components/ArenaHelpModal';
import { useGameSubscriptions } from './hooks/useGameSubscriptions';
import Gameboard from './pages/Gameboard';

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
