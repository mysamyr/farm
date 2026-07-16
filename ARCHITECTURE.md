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
    └── shared/             # Core types ONLY (User, Room, BaseEngine, Socket protocols)
```

## 3. Server Architecture

- **Game Engine Interface (`BaseGameEngine`):** Standard interface for game plugins:
  - `onGameStart(roomId, players)`
  - `handleAction(roomId, playerId, action)`
  - `onPlayerLeave(roomId, playerId)`
  - `getState(roomId)`
- **Game Registry:** Server loads all available games at startup and maps `gameType` to its corresponding
  `BaseGameEngine`.
- **Socket Router:** Global socket listeners intercept `game:action` payloads, resolve the active game engine via
  `roomId`, and forward the payload to `engine.handleAction()`.

## 4. Client Architecture

- **Lazy Loading:** `apps/client` renders `<GameContainer gameType={room.gameType} />`, which dynamically imports
  `games/${gameType}/client` using `React.lazy()`.
- **Isolated State:** Core app state (User, Active Room) is stored in global Zustand (`useAuthStore`, `useRoomStore`).
  Each game imports and mounts its own local Zustand store (`useTicTacToeStore`) inside its root UI component.

## 5. Plugin Contract Guidelines

- A game package **MUST NOT** import anything from other game packages.
- A game package **MUST ONLY** depend on `@game/shared` for core types.
- Communication between Client and Server for games MUST follow the pattern:
  - Client -> Server: `game:action` `{ roomId, type, payload }`
  - Server -> Client: `game:state_update` `{ state }` | `game:error` `{ message }`
