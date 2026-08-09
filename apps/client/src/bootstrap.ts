import { gameRegistry } from './games/registry';

// Register game loaders - add new games here
gameRegistry.registerLoader('farm', () =>
  import('@game/game-farm/client').then(m => ({
    default: m.farmConfig,
  }))
);

gameRegistry.registerLoader('arena', () =>
  import('@game/game-arena/client').then(m => ({
    default: m.arenaConfig,
  }))
);
