# Snatched AI

**Snatched AI** is an AI-powered fitness and wellness mobile app that helps users visualize their body transformation goals, track nutrition, follow personalized workout plans, and stay motivated through a gamified “Snatched Score” and weekly challenges.

The project is a production-grade **Turborepo monorepo**: a React Native (Expo) client talks to a type-safe **tRPC** API hosted on **Next.js**, with shared packages for auth, database, and validation. The stack is built for end-to-end type safety from the database schema through to the mobile UI.

---

## Features

### AI body analysis & transformation
- **Multi-angle body scans** (front, side, back) during onboarding and progress tracking
- **Snatched Score** — AI-derived body rating with current and potential scores, powered by **Google Gemini**
- **Transformation previews** — goal visualization using **OpenAI** image editing with face-aware cropping
- Benchmark comparisons against desired body shapes (e.g. postpartum, athletic, toned)

### Nutrition
- **AI meal scanning** — photograph meals for macro and calorie analysis (Gemini)
- **Personalized meal plans** — daily targets for calories, protein, carbs, and fats
- **Recipe library** with categories, ingredients, and scheduled meals
- Saved foods and meal logging on the home dashboard

### Fitness
- Curated **workout library** — home, gym, and Pilates programs with exercises and progress tracking
- **AI-generated weekly workout plans** tailored to user goals and preferences
- Workout completion flow with ratings and history

### Engagement & growth
- **Snatch Hacks** — weekly wellness tips and habit challenges
- **Milestone levels** and journey progress (week/day tracking)
- **Onboarding funnel** — goals, dietary preferences, body considerations, paywall, and social proof
- **Subscriptions** via RevenueCat (iOS & Android)

### Platform & ops
- **Better Auth** with Apple, Google, and Discord sign-in; native Expo deep linking
- **Push notifications** for reminders and engagement
- **Analytics** — Mixpanel, Vexo; **feature flags** — LaunchDarkly; **error monitoring** — Sentry
- **In-app support** — Chatwoot widget
- Multi-environment builds: **development**, **preview**, and **production** (EAS)

---

## Tech stack

| Layer | Technologies |
|-------|----------------|
| **Monorepo** | [Turborepo](https://turbo.build), pnpm workspaces |
| **Mobile** | [Expo SDK 52](https://expo.dev), React Native 0.76, [Expo Router](https://docs.expo.dev/router/introduction/) |
| **Web / API host** | [Next.js 14](https://nextjs.org) (App Router) |
| **API** | [tRPC v11](https://trpc.io), [TanStack Query](https://tanstack.com/query), [SuperJSON](https://github.com/blitz-js/superjson) |
| **Auth** | [Better Auth](https://better-auth.com) + `@better-auth/expo` |
| **Database** | [PostgreSQL](https://www.postgresql.org) via [Drizzle ORM](https://orm.drizzle.team), [Neon](https://neon.tech) serverless driver |
| **Validation** | [Zod](https://zod.dev) + `drizzle-zod` in `@omc/validators` |
| **AI** | Google Gemini (`@google/genai`), OpenAI (`openai`) |
| **Storage** | AWS S3 (`snatched-ai-bucket`) for scans, meals, and transformations |
| **Styling (mobile)** | [NativeWind](https://www.nativewind.dev) (Tailwind for React Native) |
| **Styling (web)** | Tailwind CSS, [shadcn/ui](https://ui.shadcn.com) (`@omc/ui`) |
| **State (client)** | [@legendapp/state](https://legendapp.com/open-source/state) |
| **Payments** | [RevenueCat](https://www.revenuecat.com) (`react-native-purchases`) |
| **Observability** | Sentry, Mixpanel, LaunchDarkly |
| **CI** | GitHub Actions, Turborepo remote cache (optional) |
| **Secrets** | Doppler (production workflows) |

**Runtime requirements:** Node.js ≥ 22.14.0, pnpm ≥ 9.6.0 (see [`package.json`](./package.json)).

---

## Architecture

Snatched AI follows a **shared-backend, typed-client** pattern common in T3-style monorepos, extended for mobile.

```
┌─────────────────────────────────────────────────────────────────┐
│                        apps/expo (client)                        │
│  Expo Router · NativeWind · Legend State · RevenueCat · tRPC    │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS (types from AppRouter)
┌────────────────────────────▼────────────────────────────────────┐
│                     apps/nextjs (API host)                       │
│  Next.js API routes · Better Auth · tRPC handler · S3 uploads   │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
  @omc/api              @omc/auth             @omc/db
  tRPC routers          Better Auth +         Drizzle schema
  Gemini / OpenAI       Drizzle adapter       PostgreSQL
  S3 helpers            OAuth (Apple, etc.)
        │
        └── @omc/validators (Zod schemas shared with Expo)
```

### Design decisions

1. **Monorepo with strict package boundaries** — The Expo app imports **only** `@omc/validators` for shared types/schemas (not `@omc/api` at runtime). The API package is a dev dependency on mobile for full **end-to-end type safety** without shipping server code to clients.

2. **tRPC as the single API surface** — Routers are grouped by domain (`user`, `nutrition`, `workout`, `recipe`, `snatchHack`, `mealSchedule`, etc.), keeping procedures colocated with business logic and Zod input validation.

3. **Dual AI providers by responsibility** — **Gemini** handles structured analysis (body ratings, meal macros, meal-plan generation). **OpenAI** handles generative image transformation where inpainting/editing is required.

4. **S3-first media pipeline** — User photos flow: presigned upload → server-side processing (`sharp` optimization) → AI analysis → optional transformation stored back to S3.

5. **Better Auth over NextAuth** — Native Expo OAuth, preview-deployment-friendly auth proxy, and Apple Sign In with JWT client secrets generated server-side.

6. **Multi-flavor mobile builds** — `APP_VARIANT` drives scheme, bundle ID, and universal links (`snatched-ai-dev`, `snatched-ai-preview`, `snatched-ai`) so dev, staging, and production can coexist on one device.

### Repository layout

```text
apps/
  expo/          # React Native app (primary product)
  nextjs/        # Next.js server — tRPC + auth + admin tooling
packages/
  api/           # tRPC routers & AI integrations
  auth/          # Better Auth configuration
  db/            # Drizzle schema, migrations, seeds
  validators/    # Shared Zod schemas (client + server)
  ui/            # shadcn/ui components (web)
tooling/
  eslint/        # Shared ESLint config
  prettier/      # Shared Prettier config
  tailwind/      # Shared Tailwind preset
  typescript/    # Shared tsconfig bases
```

---

## Getting started

### Prerequisites

- **Node.js** ≥ 22.14.0 and **pnpm** ≥ 9.6.0
- **PostgreSQL** database (e.g. [Supabase](https://supabase.com) or [Neon](https://neon.tech))
- **AWS S3** bucket for image storage
- API keys: `GOOGLE_API_KEY`, `OPENAI_API_KEY`
- OAuth credentials for providers you enable (Apple, Google, Discord)
- For mobile: [Xcode](https://developer.apple.com/xcode/) (iOS) and/or [Android Studio](https://developer.android.com/studio) (Android)
- Optional: [EAS CLI](https://docs.expo.dev/build/setup/) for native builds, [Doppler](https://www.doppler.com/) for production secrets

### 1. Clone and install

```bash
git clone <repository-url>
cd <repo-name>
pnpm install
```

### 2. Environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

At minimum, configure:

| Variable | Purpose |
|----------|---------|
| `POSTGRES_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Better Auth secret (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | Public URL of the Next.js app (e.g. `http://localhost:3000`) |
| `GOOGLE_API_KEY` | Gemini API for body/meal analysis |
| `OPENAI_API_KEY` | Image transformation |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | S3 uploads |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth |
| Apple auth vars | `APPLE_AUTH_*` for Sign in with Apple |

See [`packages/auth/env.ts`](./packages/auth/env.ts) and [`turbo.json`](./turbo.json) for the full list of validated environment variables.

### 3. Database setup

Push the Drizzle schema to your database:

```bash
pnpm db:push
```

Optional — open Drizzle Studio or seed reference data (workouts, recipes, snatch hacks):

```bash
pnpm db:studio
pnpm --filter @omc/db seed
```

### 4. Run the stack

**Next.js API (required for the mobile app):**

```bash
pnpm nextjs:dev
```

**Expo mobile app** (in a separate terminal):

```bash
pnpm expo:dev
```

Or run both with Turborepo watch:

```bash
pnpm dev
```

For iOS Simulator, you may need to open the simulator once via `npx expo start` from `apps/expo`, then use `pnpm expo:dev` or `pnpm dev:ios` from the Expo package scripts.

### 5. Configure Expo ↔ backend

- Point the Expo app’s API base URL at your running Next.js server (local IP or tunnel for physical devices).
- Add your Expo URL scheme to `trustedOrigins` in [`packages/auth/src/auth.ts`](./packages/auth/src/auth.ts) when testing deep links or preview builds.

---

## Usage

### Common scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Watch mode for all packages |
| `pnpm nextjs:dev` | Start Next.js dev server |
| `pnpm expo:dev` | Start Expo dev server |
| `pnpm build` | Build all packages via Turborepo |
| `pnpm typecheck` | Typecheck entire monorepo |
| `pnpm lint` / `pnpm lint:fix` | ESLint across workspaces |
| `pnpm format:fix` | Prettier write |
| `pnpm db:push` | Push schema to database |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm ui-add` | Add shadcn/ui components interactively |

### Mobile builds (EAS)

From `apps/expo`:

```bash
eas build --profile development --platform ios
eas build --profile production --platform ios
eas submit --platform ios --latest
```

Profiles are defined in [`apps/expo/eas.json`](./apps/expo/eas.json) (`development`, `preview`, `production`, `ios-simulator`).

### API domains (tRPC)

| Router | Responsibility |
|--------|----------------|
| `auth` | Session and auth helpers |
| `user` | Profile, body ratings, image transformations, onboarding data |
| `nutrition` | Meal plans, food scanning, logging |
| `recipe` | Recipe catalog and favorites |
| `mealSchedule` | Scheduled meals |
| `workout` / `exercise` | Workouts, classes, progress |
| `snatchHack` | Weekly hacks and completion tracking |
| `userDevices` | Push notification device tokens |
| `admin` | Internal admin procedures |

---

## Contributing

Contributions are welcome. Please follow these guidelines:

1. **Fork** the repository and create a branch from `main` (e.g. `feature/your-change`).
2. **Install** dependencies with `pnpm install` and ensure `.env` is configured for local development.
3. **Make focused changes** — match existing patterns (functional components, Zod validation, tRPC procedures).
4. **Import shared types in Expo only from `@omc/validators`** — do not import server packages into the mobile runtime bundle.
5. **Run checks** before opening a PR:

   ```bash
   pnpm typecheck
   pnpm lint
   pnpm format
   ```

6. **Open a pull request** with a clear description of what changed and why.

For new UI components on web, use:

```bash
pnpm ui-add
```

To scaffold a new workspace package:

```bash
pnpm turbo gen init
```

Use [GitHub Issues](../../issues) for bugs and feature requests.

---

## Deployment

### Next.js (API + auth)

Deploy `apps/nextjs` to [Vercel](https://vercel.com) (or similar). Set root directory to `apps/nextjs` and configure all environment variables from `turbo.json` `globalEnv`.

The Expo app **must** reach this deployment in production — update the client base URL accordingly.

### Expo (mobile)

Production releases go through **EAS Build** and app store submission (App Store / Google Play). Use **EAS Update** for OTA JavaScript fixes that do not require native changes.

Configure `trustedOrigins` in Better Auth for each deployment URL and Expo scheme before shipping preview or production builds.

---

## License

This project is licensed under the [MIT License](./LICENSE).

---

## Acknowledgments

The monorepo structure and tooling draw from [create-t3-turbo](https://github.com/t3-oss/create-t3-turbo) and the [T3 Stack](https://create.t3.gg/), adapted with **Better Auth**, **Expo SDK 52**, and Snatched AI–specific AI and fitness domain logic.
