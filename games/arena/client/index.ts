import type { GameConfig } from '@game/client-core/types';
import { GameId, GameColor } from '@game/shared/constants';

import {
  DEFAULT_PASSIVE_COUNT,
  GAME_RULES,
  MAX_PASSIVE_COUNT,
  MIN_PASSIVE_COUNT,
} from '../shared/index.js';

import ArenaHelpModal from './components/ArenaHelpModal.js';
import { useGameSubscriptions } from './hooks/useGameSubscriptions.js';
import { getArenaTranslations } from './i18n/index.js';
import Gameboard from './pages/Gameboard/index.js';

export const arenaConfig: GameConfig = {
  id: GameId.arena,
  maxPlayers: 4,
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
    {
      key: GAME_RULES.PASSIVE_SKILL_COUNT,
      type: 'number',
      min: MIN_PASSIVE_COUNT,
      max: MAX_PASSIVE_COUNT,
      step: 1,
      default: DEFAULT_PASSIVE_COUNT,
      label: lang =>
        getArenaTranslations(lang).game.ruleLabels[
          GAME_RULES.PASSIVE_SKILL_COUNT
        ],
    },
  ],
  GameboardPage: Gameboard,
  HelpModal: ArenaHelpModal,
  useGameSubscriptions,
};
