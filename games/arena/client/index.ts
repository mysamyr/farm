import type { GameConfig } from '@game/client-core/types';
import { GameId, GameColor } from '@game/shared/constants';

import ArenaHelpModal from './components/ArenaHelpModal.js';
import { useGameSubscriptions } from './hooks/useGameSubscriptions.js';
import Gameboard from './pages/Gameboard/index.js';

export const arenaConfig: GameConfig = {
  id: GameId.arena,
  maxPlayers: 2,
  minPlayers: 2,
  color: GameColor.blue,
  emoji: '⚔️',
  rules: [],
  GameboardPage: Gameboard,
  HelpModal: ArenaHelpModal,
  useGameSubscriptions,
};
