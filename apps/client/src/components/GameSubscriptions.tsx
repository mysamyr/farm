import { GAME_WIN_EVENT } from '@game/client-core/constants';
import type { GameId } from '@game/shared/constants';

import { useGameConfig } from '../hooks/index.js';

type GameSubscriptionsProps = {
  gameId: GameId;
};

export function GameSubscriptions({ gameId }: GameSubscriptionsProps) {
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

type GameSubscriptionsInnerProps = {
  useGameSubscriptions: (args: { onCurrentUserWon: () => void }) => void;
};

function GameSubscriptionsInner({ useGameSubscriptions }: GameSubscriptionsInnerProps) {
  useGameSubscriptions({
    onCurrentUserWon: () => {
      window.dispatchEvent(new CustomEvent(GAME_WIN_EVENT));
    },
  });

  return null;
}
