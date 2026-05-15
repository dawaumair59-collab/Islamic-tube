# IslamicTube

A professional Islamic video streaming mobile app inspired by YouTube and TikTok, built with Expo/React Native.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo + React Native + Expo Router
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/mobile/` — Expo mobile app
- `artifacts/mobile/app/` — Expo Router file-based screens
- `artifacts/mobile/components/` — Shared UI components
- `artifacts/mobile/context/` — React Context providers (Auth, Theme)
- `artifacts/mobile/data/mockData.ts` — All mock data (videos, scholars, playlists, etc.)
- `artifacts/mobile/constants/colors.ts` — Brand color tokens
- `artifacts/api-server/` — Express API server
- `lib/api-spec/openapi.yaml` — OpenAPI contract

## Architecture decisions

- Frontend-only for first build — all data uses mock data, no backend DB needed
- Expo Router file-based navigation (similar to Next.js Pages Router)
- ThemeContext for light/dark mode toggle persisted to AsyncStorage
- AuthContext for mock auth (login/logout/register)
- Colors from `constants/colors.ts` via `useColors()` hook — never hardcoded
- Reanimated for smooth animations (like button, progress bars)

## Product

IslamicTube is a premium Islamic video streaming app featuring:
- Home feed with hero banner, live indicator, category filters
- YouTube Shorts-inspired vertical Shorts feed
- Video Watch screen with player controls and comments
- Scholar Channel profiles
- Library with playlists, watch history, saved videos
- Live streaming screen with chat
- Scholar video upload flow
- Full auth (login/register/Google) flow
- Dark/light theme toggle

## User preferences

- Blue (#2563EB) primary brand color
- Light mode default, dark mode supported
- Islamic design elements (crescent moon logo, geometric patterns)
- No emojis anywhere in the UI
- Icon buttons preferred over text buttons

## Gotchas

- Mock API base URL configured as http://localhost:8000/api (axio services reference only, not active)
- Uses expo-image for all image rendering (not React Native's Image)
- useAnimatedStyle must never be called inside .map() — extract to component
- Web safe area: 67px top, 84px bottom tab bar

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
