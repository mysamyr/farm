# AGENTS.md

## Big picture (monorepo + plugin system)

- This is an npm workspace monorepo (`apps/*`, `packages/*`, `games/*`) with **core shell + pluggable games**
  (`package.json`, `ARCHITECTURE.md`).
- Core server (`apps/server`) owns rooms, matchmaking, player identity, and socket routing; games provide isolated logic
  modules (`apps/server/src/games/modules.ts`).
- Core client (`apps/client`) is a React Router shell; games are lazy-loaded plugins via `GameRegistry`
  (`apps/client/src/games/registry.ts`, `apps/client/src/bootstrap.ts`).
- Shared protocol/types live in `@game/shared` and are the contract boundary (`packages/shared/constants/index.ts`,
  `packages/shared/types/socket.ts`).

## Runtime data flow you must preserve

- Client fetches game metadata from `GET /api/games`; source is server `gameRegistry.getAllMetadata()`
  (`apps/server/src/index.ts`).
- All game actions go through one socket event: `EVENTS.GAME_ACTION` with payload `{ roomId, action: { type, ... } }`
  (`packages/shared/types/socket.ts`).
- Server routes `game:action` to the current room’s module via `registerAllGameFeatures` + `GameHandlerContext` adapter
  (`apps/server/src/games/index.ts`).
- Game modules emit authoritative updates with `EVENTS.GAME_STATE_UPDATE` and optional `EVENTS.NOTIFICATION`
  (`games/farm/server/handlers.ts`, `games/arena/server/handlers.ts`).
- Room lifecycle is state-driven (`idle -> running -> finished`) and reflected in client routing
  (`packages/shared/constants/index.ts`, `apps/client/src/games/GameContainer.tsx`).

## Plugin contract (adding/changing a game)

- Register server module in `apps/server/src/games/modules.ts` and client lazy loader in `apps/client/src/bootstrap.ts`.
- Each game exports:
  - `client/index.ts` with `GameConfig` (title/description/rules/UI/subscriptions).
  - `server/index.ts` with room init + action handlers.
  - `shared/*` with typed action payloads and constants (e.g. `GAME_RULES`).
- Keep `rules` keys aligned end-to-end: `GameConfig.rules[].key` must match server/game shared constants and
  `room.rules` shape (`games/farm/client/index.ts`, `games/farm/shared/constants.ts`).
- Do not import one game package from another; use only `@game/shared` (and `@game/client-core` on game client side) as
  shared dependencies (`ARCHITECTURE.md`).

## Project-specific client/server patterns

- Stable player identity is `userId` in localStorage, sent in socket auth (`packages/client-core/utils/identity.ts`,
  `packages/client-core/socket/client.ts`).
- Disconnects during running/finished games use a 30s reconnect grace period before removal
  (`apps/server/src/features/connection/connection.service.ts`).
- Client room/game synchronization is centralized in `useRoomSubscriptions` (rejoin flow, navigation, notifications,
  errors) (`packages/client-core/hooks/useRoomSubscriptions.ts`).
- Global Zustand slices are consolidated in one store module (`packages/client-core/store/index.ts`).
- Core copy is in `client-core`; game-specific text stays in each game’s `client/i18n` and is accessed via game
  translation hooks.

## Developer workflow (actual commands here)

- Requirements: Node `>=24` (`package.json` engines).
- Full local dev: `npm run dev` (runs API + client concurrently).
- API only: `npm run dev:api`; client only: `npm run dev:client`.
- Build all in dependency order: `npm run build` (shared -> games -> server -> client).
- Quality gates used in this repo: `npm run typecheck` and `npm run lint` (no test script is currently defined).
- Client dev server proxies `/api` and `/socket.io` to `http://localhost:3000` (`apps/client/vite.config.ts`).

## Existing AI instructions in-repo

- Follow `ARCHITECTURE.md` as a hard constraint (also repeated in `.github/copilot-instructions.md` and `.cursorrules`).
