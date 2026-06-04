import type { GameId } from '@game/shared/types';

import { arenaConfig } from './arena';
import { farmConfig } from './farm';
import { setGameConfigs } from './registry';
import type { GameConfig } from './types';

const configs: Record<GameId, GameConfig> = {
  farm: farmConfig,
  arena: arenaConfig,
};

setGameConfigs(configs);
