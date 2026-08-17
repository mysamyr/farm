import type { GameConfig } from '@game/client-core/types';
import { GameId, GameColor } from '@game/shared/constants';

import { DEFAULT_CONFIG, GAME_RULES } from '@game/game-farm/shared';

import FarmHelpModal from './components/FarmHelpModal.js';
import { useGameSubscriptions } from './hooks/useGameSubscriptions.js';
import { getFarmTranslations } from './i18n/index.js';
import Gameboard from './pages/Gameboard/index.js';

export const farmConfig: GameConfig = {
  id: GameId.farm,
  maxPlayers: DEFAULT_CONFIG.maxPlayers,
  minPlayers: DEFAULT_CONFIG.minPlayers,
  color: GameColor.orange,
  emoji: '🐄',
  rules: [
    {
      key: GAME_RULES.EXTRA_DUCK,
      label: lang =>
        getFarmTranslations(lang).game.ruleLabels[GAME_RULES.EXTRA_DUCK],
    },
    {
      key: GAME_RULES.ONE_EXCHANGE,
      label: lang =>
        getFarmTranslations(lang).game.ruleLabels[GAME_RULES.ONE_EXCHANGE],
    },
    {
      key: GAME_RULES.UNLIMITED_CARDS,
      label: lang =>
        getFarmTranslations(lang).game.ruleLabels[GAME_RULES.UNLIMITED_CARDS],
    },
    {
      key: GAME_RULES.ALLOW_PLAYER_TRADE,
      label: lang =>
        getFarmTranslations(lang).game.ruleLabels[
          GAME_RULES.ALLOW_PLAYER_TRADE
        ],
    },
  ],
  GameboardPage: Gameboard,
  HelpModal: FarmHelpModal,
  useGameSubscriptions,
};
