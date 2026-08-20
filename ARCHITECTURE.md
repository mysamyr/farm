# ARCHITECTURE.md

## 1. General Concept

Monorepo setup using npm workspaces. The Core app handles authentication-by-username, room creation, matchmaking,
theming, and dynamic event routing. Individual games act as isolated plugins implementing a strict contract on both
client (`GameConfig`) and server (`ServerGameModule`).

## 2. Directory Layout

```
/
├── apps/
│   ├── server/             # Express + Socket.io (Core Routing, Rooms, Game Registry)
│   └── client/             # React shell: catalog, room dashboard, router, plugin loaders
│       └── public/assets/banners/  # Per-game catalog banners (farm.jpeg, arena.jpeg)
├── games/
│   ├── farm/               # Game Plugin: Farm
│   │   ├── client/         # Gameboard, HelpModal, i18n, subscriptions, GameConfig export
│   │   ├── server/         # Game logic engine & action handlers
│   │   └── shared/         # Game-specific types, rules, metadata, event constants
│   └── arena/              # Game Plugin: Arena (same layout)
└── packages/
    ├── shared/             # Core types ONLY (User/Room, GameMetadata, BaseEngine, Socket protocols)
    └── client-core/        # Shared client utilities (components, hooks, stores, socket, i18n, theme)
```

## 3. Server Architecture

- **Game Handler Context (`GameHandlerContext`):** Abstraction layer that bridges Socket.io to game-agnostic handler code:
  - `on(event, handler)` – Register event listeners
  - `emitToRoom(roomId, event, payload)` – Broadcast to a room
  - `emitToSocket(socketId, event, payload)` – Send to specific socket
  - `getRoomById(roomId)` – Access room state
  - `kickPlayer(roomId, playerId)` – Blacklist + remove a player (game-initiated)
  - `getSocketData(key)` / `setSocketData(key, value)` – Socket session storage
  - `log(message, data)` – Structured logging

- **Server Game Module Interface (`ServerGameModule`):** Standard contract for game plugins:
  - `gameId: GameId`
  - `config: { minPlayers, maxPlayers }`
  - `metadata: GameMetadata` – Client-consumable game info (`id`, `name`, `emoji`, `color`, player limits)
  - `canStartGame?(room)` – Validation before game start
  - `addRoomFields()` – Initialize game-specific room fields (including `rules`)
  - `onGameStart?(io, room)` – Lifecycle hook when game begins
  - `onPlayerRemoved?(room, playerId)` – Handle player departure & Host Migration
  - `onPlayerReconnected?(room, oldPlayerId, newPlayerId)` – Handle reconnection
  - `onPlayerWin?(io, room, player)` – Handle win condition (notifications + rematch / post-game)
  - `handleAction?(ctx, payload, ack)` – Process game actions via `GameHandlerContext`

- **Game Registry:** Centralized registry that loads all game modules at startup and provides:
  - `register(module)` – Register a game module
  - `get(gameId)` – Retrieve module by ID
  - `getAll()` / `getAllMetadata()` – Access all games
  - Type-safe game lookups
  - Metadata is exposed to the client via `GET /api/games`

- **Unified Game Action Router:** `registerAllGameFeatures()` intercepts `game:action` socket events and:
  1. Looks up the room by ID
  2. Retrieves the game module from the registry
  3. Creates a `GameHandlerContext` adapter (bridges Socket.io ↔ generic interface)
  4. Invokes `gameModule.handleAction(ctx, payload, ack)` with optional acknowledgment callback

## 4. Client Architecture

### Shell & routing

- **`apps/client`** is a React Router shell. Routes live under `MainLayout` (`Header` + `<Outlet />`):
  - `/` – Catalog of available games
  - `/:gameId` – Per-game lobby (open rooms, create room, active room)
  - `/:gameId/play` – In-game board (`GameContainer`)
- **`activeGame`** is derived from the URL (`useActiveGame`), not from a dedicated auth store. Invalid game IDs redirect to the catalog.
- On first visit, a required `ChangeNameModal` is shown until a username is set.

### Header & chrome

- Shared `Header` (desktop tools + mobile `Sidebar`): logo/catalog link, online count, language, light/dark theme, help, username.
- Help is context-aware: catalog shows `SiteRulesModal`; a selected game shows that plugin’s `HelpModal`.
- Leaving an in-progress room is confirmed from the header on the play route. Navigating back to the catalog from an idle room leaves that room (`cleanupCurrentIdleRoom`).
- Theme is stored in localStorage and applied as `data-theme`. The active game’s `metadata.color` is applied as `data-accent`.

### Catalog & lobby

- **Catalog** lists games from `GET /api/games` (`useGames` / `useGamesStore`). Each `GameCard` uses plugin `GameConfig` for localized title, short description, and banner (`bannerUrl` under `apps/client/public/assets/banners/`), plus live open-room counts.
- **Game page** (`ActionBar` + room grid + `ActiveRoom`) filters rooms by `activeGame`. Room create/join/kick/start stay in core; games only supply rule labels via `GameConfig.rules`.

### Plugin loading

- Game loaders are registered in `apps/client/src/bootstrap.ts` (the only place that names concrete games). `GameRegistry` stays game-agnostic:
  - `registerLoader(gameId, loader)` – Dynamic `import()` of the plugin’s `GameConfig`
  - `loadConfig(gameId)` – Load and cache config
  - `getLazyGameboard(gameId)` – `React.lazy` wrapper around `config.GameboardPage`
- **`GameContainer`** waits for room rejoin, then Suspense-loads the gameboard with an error boundary.
- **`GameSubscriptions`** runs the plugin’s `useGameSubscriptions` hook (win event → `PostGameOverlay`).

### Client Game Module Interface (`GameConfig`)

Each game’s `client/index.ts` exports a `GameConfig`:

- `id`, `minPlayers`, `maxPlayers`, `color`, `emoji`, `bannerUrl`
- `title(language)` / `shortDescription(language)` – Localized catalog copy
- `rules: { key, label(language) }[]` – Lobby rule toggles (keys match server `GAME_RULES`)
- `GameboardPage` – Root in-game UI
- `HelpModal` – Game rules modal (uses shared `HelpModal` layout from client-core)
- `useGameSubscriptions({ onCurrentUserWon })` – Socket listeners for that game’s state

### State & i18n

- Core Zustand stores live in `@game/client-core` (`useRoomsStore`, `useGamesStore`, `useLanguageStore`, `useThemeStore`, `useUsernameStore`, `useModalStore`, `useSnackbarStore`, `useConnectionStore`). There is no `useAuthStore`.
- Core copy (catalog, dashboard, header, errors, post-game) is in `client-core` (`en` / `ua`).
- Game copy lives in each plugin (`games/<id>/client/i18n/`) and is accessed through that game’s translation helper (e.g. `useFarmTranslation`). Games must not put UI strings into core translations.

## 5. Plugin Contract Guidelines

- A game package **MUST NOT** import anything from other game packages.
- A game **client** may depend on `@game/client-core` (shared UI, hooks, socket helpers) and `@game/shared`.
- A game **server** and **shared** layer **MUST ONLY** depend on `@game/shared` (plus the game’s own `shared/`).
- Display metadata is split:
  - Server `GameMetadata` – stable id, fallback name, emoji, accent color, player limits (for `/api/games`)
  - Client `GameConfig` – banners, localized titles/descriptions, rule labels, UI entry points
- Communication between Client and Server for games MUST follow the pattern:
  - Client -> Server: `game:action` `{ roomId, action: { type, ...payload } }`
  - Server -> Client: `game:state_update` `{ state }` | `game:error` `{ message }`
