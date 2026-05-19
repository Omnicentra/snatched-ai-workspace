# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This is a **Turborepo monorepo** ("Snatched AI") with:
- `apps/nextjs` — Next.js 14 web app (landing pages + tRPC API server)
- `apps/expo` — React Native / Expo mobile app (cannot be run in Cloud VM without emulators)
- `packages/api` — tRPC v11 router
- `packages/auth` — Better Auth authentication
- `packages/db` — Drizzle ORM + PostgreSQL (Neon in prod, local PostgreSQL in dev)
- `packages/ui` — shadcn/ui component library
- `packages/validators` — Shared Zod schemas
- `tooling/` — eslint, prettier, tailwind, typescript configs

### Running the Next.js dev server

```bash
cd /workspace/apps/nextjs && pnpm dev
```

Or from root: `pnpm dev:next` (uses turborepo watch mode).

The server starts on `http://localhost:3000`. Pages like `/`, `/privacy`, `/terms`, `/delete-account` render without database/API calls. API routes (`/api/trpc/*`, `/api/panel`) require valid auth credentials (particularly `APPLE_AUTH_PRIVATE_KEY` must be a real ES256 key).

### Database

A local PostgreSQL 16 instance runs on port 5432. Start it with:

```bash
sudo pg_ctlcluster 16 main start
```

Database name: `snatched_dev`, user: `ubuntu`, password: `devpassword`.

Push schema changes: `cd packages/db && pnpm with-env drizzle-kit push`

### Environment variables

The `.env` file in the repository root is loaded by `dotenv-cli` via the `with-env` scripts. Required env vars are validated by `@t3-oss/env-nextjs` in `apps/nextjs/src/env.ts` and `packages/auth/env.ts`. Validation is **skipped** when `CI=true` or during `lint`.

**Doppler secrets:** Cloud Agent VMs do not use Cursor “Add secrets” for this repo — use Doppler files in the workspace instead. Download with Doppler CLI, or maintain `.env.dev` / `.env.prod` manually, then activate:

```bash
cp .env.dev .env   # development (recommended)
# cp .env.prod .env   # production
```

Restart the Next.js dev server after changing `.env`. With `DOPPLER_ENVIRONMENT=prd`, `/api/panel` returns 404 by design; use `.env.dev` if you need the tRPC panel UI.

`drizzle-kit push` against the remote dev `POSTGRES_URL` may fail from the VM (pooler/connection drops); the Next.js app and tRPC still load with `.env.dev` — verify with `curl` on `/api/panel` (expect 200 in dev) and `/api/auth/get-session`.

Placeholder values are sufficient for:
- Running the dev server (homepage/static pages render fine)
- Running lint and typecheck

Real credentials are needed for:
- tRPC API routes (auth initialization requires a valid `APPLE_AUTH_PRIVATE_KEY`)
- OAuth flows (Google, Discord, Apple)
- AI features (OpenAI, Google Gemini)
- S3 uploads

### Key commands

| Task | Command |
|------|---------|
| Install deps | `pnpm i` |
| Dev (all) | `pnpm dev` |
| Dev (Next.js only) | `pnpm dev:next` |
| Lint | `pnpm lint` |
| Typecheck | `pnpm typecheck` |
| Format | `pnpm format` |
| DB push | `pnpm db:push` |
| DB studio | `pnpm db:studio` |

### Known pre-existing issues

- `pnpm lint` reports ~132 problems (88 errors, 44 warnings) across multiple packages — these are pre-existing in the codebase.
- `pnpm typecheck` fails on `@omc/tailwind-config` due to duplicate properties in `web.ts` — pre-existing.
- The `pnpm db:push` turborepo script requires `--ui=tui`; use `cd packages/db && pnpm with-env drizzle-kit push` directly instead.

### Gotchas

- The `postinstall` script runs `pnpm lint:ws` (sherif workspace linter) which downloads on first run. This is normal.
- Build scripts for `@sentry/cli`, `bufferutil`, `core-js-pure`, `esbuild`, `sharp` are ignored by pnpm's default policy. This does not affect development — esbuild works via platform-specific optional deps.
- The Expo app cannot be tested in the Cloud VM (no iOS/Android emulators available).
