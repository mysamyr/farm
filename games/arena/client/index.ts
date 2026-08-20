import type { GameConfig } from '@game/client-core/types';
import { GameId, GameColor } from '@game/shared/constants';

import { GAME_RULES } from '../shared/index.js';

import ArenaHelpModal from './components/ArenaHelpModal.js';
import { useGameSubscriptions } from './hooks/useGameSubscriptions.js';
import { getArenaTranslations } from './i18n/index.js';
import Gameboard from './pages/Gameboard/index.js';

export const arenaConfig: GameConfig = {
  id: GameId.arena,
  maxPlayers: 2,
  minPlayers: 2,
  color: GameColor.blue,
  emoji: '⚔️',
  bannerUrl: '/assets/banners/arena.jpeg',
  title: lang => getArenaTranslations(lang).game.name,
  shortDescription: lang => getArenaTranslations(lang).game.shortDescription,
  rules: [
    {
      key: GAME_RULES.ZERO_COOLDOWN,
      label: lang =>
        getArenaTranslations(lang).game.ruleLabels[GAME_RULES.ZERO_COOLDOWN],
    },
  ],
  GameboardPage: Gameboard,
  HelpModal: ArenaHelpModal,
  useGameSubscriptions,
};
