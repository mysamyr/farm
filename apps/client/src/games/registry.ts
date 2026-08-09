import { type ComponentType, lazy, type LazyExoticComponent } from 'react';

import type { GameId } from '@game/shared/types';

import type { GameConfig } from './types';

export type { GameConfig, RuleConfig } from './types';

/** Loader function type for lazy loading game configs */
export type GameLoader = () => Promise<{ default: GameConfig } | GameConfig>;

/**
 * Registry for managing client-side game configurations.
 * Supports true lazy loading of game plugins.
 * Game loaders are registered externally to keep this module game-agnostic.
 */
class GameRegistry {
  private loaders = new Map<GameId, GameLoader>();
  private configs = new Map<GameId, GameConfig>();
  private configPromises = new Map<GameId, Promise<GameConfig>>();
  private lazyComponents = new Map<
    GameId,
    LazyExoticComponent<ComponentType>
  >();

  /**
   * Register a loader for a game.
   * Called by game plugins during bootstrap.
   */
  registerLoader(gameId: GameId, loader: GameLoader): void {
    this.loaders.set(gameId, loader);
  }

  /**
   * Check if a game loader is registered.
   */
  hasLoader(gameId: GameId): boolean {
    return this.loaders.has(gameId);
  }

  /**
   * Load and cache a game configuration.
   */
  async loadConfig(gameId: GameId): Promise<GameConfig> {
    // Return cached config if available
    const cached = this.configs.get(gameId);
    if (cached) {
      return cached;
    }

    // Return in-flight promise if loading
    const pending = this.configPromises.get(gameId);
    if (pending) {
      return pending;
    }

    // Start loading
    const loader = this.loaders.get(gameId);
    if (!loader) {
      throw new Error(`No loader registered for game "${gameId}"`);
    }

    const promise = loader().then(module => {
      const config = 'default' in module ? module.default : module;
      this.configs.set(gameId, config);
      this.configPromises.delete(gameId);
      return config;
    });

    this.configPromises.set(gameId, promise);
    return promise;
  }

  /**
   * Get a cached game configuration.
   * Returns undefined if not yet loaded.
   */
  getConfig(gameId: GameId): GameConfig | undefined {
    return this.configs.get(gameId);
  }

  /**
   * Get a cached game configuration or throw.
   * @throws Error if game is not loaded
   */
  get(gameId: GameId): GameConfig {
    const config = this.configs.get(gameId);
    if (!config) {
      throw new Error(`Game "${gameId}" is not loaded. Call loadConfig first.`);
    }
    return config;
  }

  /**
   * Check if a game config is loaded.
   */
  isLoaded(gameId: GameId): boolean {
    return this.configs.has(gameId);
  }

  /**
   * Get all loaded game IDs.
   */
  getLoadedGames(): GameId[] {
    return Array.from(this.configs.keys());
  }

  /**
   * Get a lazy-loaded gameboard component.
   * Creates and caches the lazy component on first access.
   */
  getLazyGameboard(gameId: GameId): LazyExoticComponent<ComponentType> {
    let lazyComponent = this.lazyComponents.get(gameId);
    if (!lazyComponent) {
      lazyComponent = lazy(async () => {
        const config = await this.loadConfig(gameId);
        return { default: config.GameboardPage };
      });
      this.lazyComponents.set(gameId, lazyComponent);
    }
    return lazyComponent;
  }
}

// Singleton instance
export const gameRegistry = new GameRegistry();
