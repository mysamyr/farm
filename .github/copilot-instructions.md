# Project Guidelines

## Scope

- Monorepo with three workspaces:
  - apps/client: React 19 + Zustand + Vite frontend
  - apps/server: Express + Socket.IO backend
  - packages/shared: shared runtime constants, utils and TypeScript types
- Server serves static frontend from apps/client/dist.
- Shared package is consumed by both client and server through @game/shared subpath exports.

## Build And Validate

- Use Node 22+ and npm 11+.
- Install dependencies from repo root: npm install
- Main development flow: npm run dev
- Build all workspaces from root: npm run build
- Validate changes before finishing:
  - npm run lint
  - npm run typecheck
- There is no test script in this repo. Don't add them.

## Server Modules

### Core Features (`apps/server/src/features/`)

Game-agnostic socket handlers, each exporting a `register*Feature(io, socket)` function:

- `connection/` — lifecycle (join, leave, reconnect)
- `player/` — player state mutations
- `room/` — room CRUD and membership

### Game Modules (`apps/server/src/games/`)

Game-specific logic, each exporting `registerGameFeature(io, socket)`:

- Add new games here; register them in `apps/server/src/socket/handlers.ts`.
- `apps/server/src/games/index.ts` exports the shared `GameModule<TRoom, TPlayer>` type.
- Game modules import from `apps/server/src/features/` for shared room/player helpers.

## Client Modules

### Game Registry (`apps/client/src/games/registry.ts`)

Central registry with `GameConfig` interface and `registerGame` / `getGameConfig` helpers. Each game module calls `registerGame({...})` from its `index.ts` on load.

### Game Modules (`apps/client/src/games/{gameId}/`)

Each game module provides:

- `index.ts` — calls `registerGame` with the full `GameConfig`
- `pages/Gameboard/` — game board page component
- `components/` — game-specific UI (modals, overlays)
- `hooks/` — game-specific subscriptions and state (`useGameSubscriptions`, etc.)
- `constants/` — game-specific client constants
- `utils/` — game-specific helpers

### Shared UI (`apps/client/src/components/ui/`)

Reusable, game-agnostic presentational components. Keep room/game orchestration in page entry files; keep game-specific UI inside the game module.

## Architecture Boundaries

- Keep game-agnostic base types and constants in packages/shared.
- Keep game-specific logic and types in packages/shared/constants/{gameId} / packages/shared/types/{gameId}.
- Keep server-side game logic inside the matching game module (`apps/server/src/games/{gameId}/`), not in core features.
- Register all socket handlers (core + game) through `apps/server/src/socket/handlers.ts`.
- Register all client game modules via `registerGame` in the game's `index.ts`; never import game components directly outside that module.

## Conventions

- TypeScript is strict across workspaces; preserve strict typing and avoid any.
- Follow existing import ordering and lint rules from eslint.config.ts.
- In server files (apps/server/\*_/_.ts), console usage is forbidden by lint; use logger utilities.
- Prefer extending shared base types over redefining overlapping room/player/rules structures.
- For Socket.IO handlers that read socket.data, use the project AppSocket typing pattern instead of relying on default Socket generics.
- In Gameboard feature components, prefer reading shared room/language context through local hooks and keep props focused on page-owned actions/state.

## Common Pitfalls

- Build order matters for runtime imports: shared must be built before server/client. Use root npm run build to enforce the correct order.
- Production start entry is apps/server/dist/apps/server/src/index.js.
- Server static client path is resolved from process.cwd() as apps/client/dist; missing client build will break static serving.

## References

- Setup and scripts: README.md
- Game mechanics: rules.md
- Root commands and workspace orchestration: package.json
- Server bootstrap and static serving: apps/server/src/index.ts
- Socket registration pattern: apps/server/src/socket/handlers.ts
- Shared type patterns: packages/shared/types/index.ts
- When adding a new game: create `apps/server/src/games/{gameId}/` with `registerGameFeature`, create `apps/client/src/games/{gameId}/` with `registerGame`, add entries in `apps/server/src/socket/handlers.ts` and `apps/client/src/games/index.ts`.
