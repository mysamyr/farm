import type { BasePlayer, BaseRoom, BaseRules } from '../types';

/**
 * Base game state that all game states must extend.
 */
export interface BaseGameState<
  TPlayer extends BasePlayer = BasePlayer,
  TRules extends BaseRules = BaseRules,
> extends BaseRoom<TPlayer, TRules> {
  order: string[];
  turn: number;
  winner?: string;
}

/**
 * Action result returned by handleAction.
 */
export interface ActionResult<TState extends BaseGameState> {
  state: TState;
  error?: string;
}

/**
 * Core game engine interface that all game plugins must implement.
 * @template TState - The game-specific state type extending BaseGameState
 * @template TAction - The game-specific action payload type
 */
export interface BaseGameEngine<
  TState extends BaseGameState = BaseGameState,
  TAction = unknown,
> {
  readonly gameId: string;

  /**
   * Initialize a new game when the room owner starts the game.
   * @param room - The room with players ready to play
   * @returns Initial game state
   */
  onGameStart(room: BaseRoom): TState;

  /**
   * Process a player action and return the updated state.
   * @param state - Current game state
   * @param playerId - The player performing the action
   * @param action - Game-specific action payload
   * @returns Updated state and optional error message
   */
  handleAction(
    state: TState,
    playerId: string,
    action: TAction
  ): ActionResult<TState>;

  /**
   * Handle a player leaving mid-game (disconnect or voluntary leave).
   * @param state - Current game state
   * @param playerId - The player who left
   * @returns Updated state (may end game or reassign turn)
   */
  onPlayerLeave(state: TState, playerId: string): TState;

  /**
   * Get serializable state to send to clients (may filter sensitive data).
   * @param state - Full game state
   * @param playerId - Optional: filter state for specific player's view
   * @returns State safe to broadcast
   */
  getClientState(state: TState, playerId?: string): TState;
}

/**
 * Game module definition for registration with GameRegistry.
 */
export interface GameModule<
  TState extends BaseGameState = BaseGameState,
  TAction = unknown,
> {
  engine: BaseGameEngine<TState, TAction>;
  config: {
    minPlayers: number;
    maxPlayers: number;
  };
}

/**
 * Context provided to game handlers for socket operations.
 * Abstracts socket.io from game-specific handler code.
 */
export interface GameHandlerContext {
  /** Current socket ID */
  readonly socketId: string;

  /** Register an event listener */
  on<TPayload, TAck>(
    event: string,
    handler: (payload: TPayload, ack?: TAck) => void
  ): void;

  /** Emit an event to a specific room */
  emitToRoom(roomId: string, event: string, payload: unknown): void;

  /** Emit an event to a specific socket */
  emitToSocket(socketId: string, event: string, payload: unknown): void;

  /** Get a room by ID */
  getRoomById(roomId: string): BaseRoom | null;

  /** Log a message */
  log(message: string, data?: Record<string, unknown>): void;

  /** Get socket session data */
  getSocketData(key: string): unknown;

  /** Set socket session data */
  setSocketData(key: string, value: unknown): void;
}
