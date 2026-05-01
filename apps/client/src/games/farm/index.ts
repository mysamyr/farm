import { DEFAULT_CONFIG, GAME_RULES } from '@game/shared/constants/farm';

import { registerGame } from '../registry';

import FarmHelpModal from './components/FarmHelpModal';
import { useGameSubscriptions } from './hooks/useGameSubscriptions';
import Gameboard from './pages/Gameboard';

registerGame({
  id: 'farm',
  maxPlayers: DEFAULT_CONFIG.maxPlayers,
  minPlayers: DEFAULT_CONFIG.minPlayers,
  rules: [
    { key: GAME_RULES.EXTRA_DUCK, label: t => t[GAME_RULES.EXTRA_DUCK] ?? '' },
    {
      key: GAME_RULES.ONE_EXCHANGE,
      label: t => t[GAME_RULES.ONE_EXCHANGE] ?? '',
    },
    {
      key: GAME_RULES.UNLIMITED_CARDS,
      label: t => t[GAME_RULES.UNLIMITED_CARDS] ?? '',
    },
    {
      key: GAME_RULES.ALLOW_PLAYER_TRADE,
      label: t => t[GAME_RULES.ALLOW_PLAYER_TRADE] ?? '',
    },
  ],
  GameboardPage: Gameboard,
  HelpModal: FarmHelpModal,
  useGameSubscriptions,
});
