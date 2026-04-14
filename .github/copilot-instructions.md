# Project Guidelines

## Scope

- Monorepo with three workspaces:
  - apps/client: React 19 + Vite frontend
  - apps/server: Express + Socket.IO backend
  - packages/shared: shared runtime constants and TypeScript types
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
- There is currently no test script in this repo. Do not claim tests were run unless you add and run them.

## Architecture Boundaries

- Keep game-agnostic base types and constants in packages/shared.
- Keep Farm game rules and server-side game logic in apps/server/src/games/farm.
- Keep room/game UI state orchestration in page entry files, and keep reusable presentational UI in apps/client/src/components/ui.
- Register Socket.IO feature handlers through apps/server/src/socket/handlers.ts instead of wiring ad hoc listeners in random files.

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
