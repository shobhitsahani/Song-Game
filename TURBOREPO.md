# Song Game — Turborepo

Turborepo monorepo. Run everything from `musicTrivia/` (the Turbo root).

## Workspaces

| Package | Path | Purpose |
|---------|------|---------|
| `apps-api` | `apps/api` | Express + Socket.IO backend |
| `apps-web` | `apps/web` | Next.js 15 frontend |
| `@song-game/types` | `packages/types` | Shared TypeScript contracts |
| `@song-game/shared` | `packages/shared` | Room codes, scoring, XP helpers |
| `@song-game/socket` | `packages/socket` | Socket event constants |
| `@song-game/ui` | `packages/ui` | Shared React primitives |

Legacy `backend/` and `frontend/` folders are deprecated snapshots and are **not** part of the npm workspaces or Turbo pipeline. Use `apps/api` and `apps/web`.

## Commands (run in `musicTrivia/`)

```bash
npm install
npm run dev            # turbo: all packages + apps in dependency order
npm run dev:api        # turbo --filter=apps-api
npm run dev:web        # turbo --filter=apps-web
npm run build          # turbo: types -> shared/socket/ui -> api/web
npm run build:packages # shared libraries only
npm run lint           # turbo lint across all workspaces
npm run typecheck      # turbo typecheck across all workspaces
npm run db:generate    # prisma generate for apps/api
npm run db:push        # prisma db push for apps/api
npm run db:migrate     # prisma migrate dev for apps/api
```

The repo root (`C:\projects\music-trivia\package.json`) forwards all of the above to `musicTrivia/`, so `npm run build`, `npm run dev:api`, etc. also work from the outer checkout.

## Turbo graph

`turbo.json` declares:

- `build` with `dependsOn: ["^build"]` — shared packages compile before `apps-api` and `apps-web`.
- `dev` as persistent, uncached, depending on upstream builds.
- `lint`, `typecheck`, `clean`, `db:*`, `start` wired for filtering.
- Build outputs: `dist/**` for libraries/API and `.next/**` (minus `.next/cache/**`) for the Next.js app.

Verify wiring with:

```bash
./node_modules/.bin/turbo run build --dry=json
./node_modules/.bin/turbo run lint --dry=json
```

Note: run Turbo from `musicTrivia/` (its CWD must be the Turbo root). The `--prefix musicTrivia` npm wrapper works for `npm run ...` scripts, but direct `turbo` invocations resolve the workspace from CWD.

## Platform wiring

- `vercel.json`: `npx turbo run build --filter=apps-web`, output `apps/web/.next`.
- `render.yaml`: `npx turbo run db:generate build --filter=apps-api`, start `npm run start --workspace=apps-api`.
- `Dockerfile`: multi-stage `turbo prune apps/web apps/api --docker` + `turbo run build --filter=apps-web --filter=apps-api`.
- `docker-compose.yml`: unchanged service topology (`api` serves `apps/api/dist`, `web` serves the Next.js standalone output).
- `scripts/setup.sh`: single `npm install` at the Turbo root + `npm run db:generate`.
