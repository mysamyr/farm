# ARCHITECTURE.md

## 1. General Concept

Monorepo setup using npm workspaces. The Core app handles authentication, room creation, matchmaking, and dynamic event
routing. Individual games act as isolated plugins implementing a strict contract.

## 2. Directory Layout

```
/
├── apps/
│   ├── server/             # Express + Socket.io (Core Routing, Rooms)
│   └── client/             # React + Zustand (Core Shell, Room UI, Router)
├── games/
│   ├── farm/               # Game Plugin: Farm
│   │   ├── client/         # Game-specific UI and Zustand store
│   │   ├── server/         # Game logic engine & action handlers
│   │   └── shared/         # Game-specific types and event constants
│   └── arena/              # Game Plugin: Arena
└── packages/
    ├── shared/             # Core types ONLY (User, Room, BaseEngine, Socket protocols)
    └── client-core/        # Shared client utilities (components, hooks, stores, socket, utils)
```

## 3. Server Architecture

- **Game Handler Context (`GameHandlerContext`):** Abstraction layer that bridges Socket.io to game-agnostic handler code:
  - `on(event, handler)` – Register event listeners
  - `emitToRoom(roomId, event, payload)` – Broadcast to a room
  - `emitToSocket(socketId, event, payload)` – Send to specific socket
  - `getRoomById(roomId)` – Access room state
  - `getSocketData(key)` / `setSocketData(key, value)` – Socket session storage
  - `log(message, data)` – Structured logging

- **Server Game Module Interface (`ServerGameModule`):** Standard contract for game plugins:
  - `config: { minPlayers, maxPlayers }`
  - `metadata: GameMetadata` – Client-consumable game info
  - `canStartGame?(room)` – Validation before game start
  - `addRoomFields()` – Initialize game-specific room fields
  - `onGameStart?(io, room)` – Lifecycle hook when game begins
  - `onPlayerRemoved?(room, playerId)` – Handle player departure
  - `onPlayerReconnected?(room, oldPlayerId, newPlayerId)` – Handle reconnection
  - `onPlayerWin?(io, room, player)` – Handle win condition
  - `handleAction?(ctx, payload, ack)` – Process game actions via `GameHandlerContext`

- **Game Registry:** Centralized registry that loads all game modules at startup and provides:
  - `register(module)` – Register a game module
  - `get(gameId)` – Retrieve module by ID
  - `getAll()` / `getAllMetadata()` – Access all games
  - Type-safe game lookups

- **Unified Game Action Router:** `registerAllGameFeatures()` intercepts `game:action` socket events and:
  1. Looks up the room by ID
  2. Retrieves the game module from the registry
  3. Creates a `GameHandlerContext` adapter (bridges Socket.io ↔ generic interface)
  4. Invokes `gameModule.handleAction(ctx, payload, ack)` with optional acknowledgment callback

## 4. Client Architecture

- **Lazy Loading:** `apps/client` renders `<GameContainer gameType={room.gameType} />`, which dynamically imports
  `games/${gameType}/client` using `React.lazy()`.
- **Isolated State:** Core app state (User, Active Room) is stored in global Zustand (`useAuthStore`, `useRoomStore`).
  Each game imports and mounts its own local Zustand store (`useTicTacToeStore`) inside its root UI component.

## 5. Plugin Contract Guidelines

- A game package **MUST NOT** import anything from other game packages.
- A game package **MUST ONLY** depend on `@game/shared` for core types.
- Communication between Client and Server for games MUST follow the pattern:
  - Client -> Server: `game:action` `{ roomId, action: { type, ...payload } }`
  - Server -> Client: `game:state_update` `{ state }` | `game:error` `{ message }`
