import type { GameId } from '@game/shared/types';

import { GAME_WIN_EVENT } from '../constants/events';
import { getGameConfig } from '../games/registry';

export function GameSubscriptions({ gameId }: { gameId: GameId }) {
  const { useGameSubscriptions } = getGameConfig(gameId);

  useGameSubscriptions({
    onCurrentUserWon: () => {
      window.dispatchEvent(new CustomEvent(GAME_WIN_EVENT));
    },
  });

  return null;
}
