import { GAME_WIN_EVENT } from '@game/client-core/constants';
import type { GameId } from '@game/shared/constants';

import { useGameConfig } from '../hooks/index.js';

export function GameSubscriptions({ gameId }: { gameId: GameId }) {
  const { config } = useGameConfig(gameId);

  // Wait for config to load
  if (!config) {
    return null;
  }

  return (
    <GameSubscriptionsInner
      useGameSubscriptions={config.useGameSubscriptions}
    />
  );
}

function GameSubscriptionsInner({
  useGameSubscriptions,
}: {
  useGameSubscriptions: (args: { onCurrentUserWon: () => void }) => void;
}) {
  useGameSubscriptions({
    onCurrentUserWon: () => {
      window.dispatchEvent(new CustomEvent(GAME_WIN_EVENT));
    },
  });

  return null;
}
