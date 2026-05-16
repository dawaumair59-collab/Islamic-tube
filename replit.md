# IslamicTube

A professional Islamic video streaming mobile app inspired by YouTube and TikTok, built with Expo/React Native and Django REST Framework backend.

## Run & Operate

- `pnpm --filter @workspace/mobile run dev` — run the mobile app (port 5000, web preview)
- `cd artifacts/django-backend && python3 manage.py runserver 0.0.0.0:8000` — run Django API (port 8000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo + React Native + Expo Router
- Backend: Django 5 + Django REST Framework + SQLite (dev)
- Auth: JWT via `rest_framework_simplejwt`
- Build: Metro bundler with custom API proxy middleware

## Where things live

- `artifacts/mobile/` — Expo mobile app
- `artifacts/mobile/app/` — Expo Router file-based screens
- `artifacts/mobile/components/` — Shared UI components
- `artifacts/mobile/context/` — React Context providers (Auth, Theme)
- `artifacts/mobile/services/api.ts` — Central API service (Axios client, normalizers, all API modules)
- `artifacts/mobile/data/mockData.ts` — Static mock data (playlists, live streams, categories)
- `artifacts/mobile/constants/colors.ts` — Brand color tokens
- `artifacts/mobile/metro.config.js` — Metro proxy: /api/* → Django at localhost:8000
- `artifacts/django-backend/` — Django REST API

## Architecture decisions

- Metro dev server proxies `/api/*` to Django at `localhost:8000` (no CORS issues on web)
- `services/api.ts` uses `http://localhost:5000/api` on web (via Metro proxy), `EXPO_PUBLIC_API_URL` on native
- AuthContext uses real JWT tokens stored in AsyncStorage
- Videos, comments, scholars, search, likes, subscriptions all connected to Django
- PLAYLISTS and LIVE_STREAMS remain mock data (no backend API yet)
- ThemeContext for light/dark mode toggle persisted to AsyncStorage
- Colors from `constants/colors.ts` via `useColors()` hook — never hardcoded
- Reanimated for smooth animations (like button, progress bars)
- `normalizeVideo()` in api.ts: capitalizes category, formats views (K/M), relative timestamps

## Django API endpoints

- `GET /api/videos/` — video list (supports ?type=long|short, ?category=, ?search=, ?scholar=)
- `GET /api/videos/<id>/` — video detail
- `GET /api/videos/<id>/comments/` — comments for video
- `POST /api/videos/<id>/comments/` — add comment (auth required)
- `POST /api/videos/<id>/like/` — like video (auth required)
- `DELETE /api/videos/<id>/unlike/` — unlike (auth required)
- `GET /api/auth/scholars/` — list scholars (returns `{success, count, scholars: [...]}`)
- `POST /api/auth/login/` — JWT login
- `POST /api/auth/register/` — register user
- `POST /api/subscriptions/follow/<username>/` — subscribe to scholar
- `DELETE /api/subscriptions/unfollow/<username>/` — unsubscribe
- `GET /api/search/` — search videos+scholars (?q=query)
- `GET /api/search/trending/` — trending search terms

## Product

IslamicTube is a premium Islamic video streaming app featuring:
- Home feed with hero banner, live indicator, category filters
- YouTube Shorts-inspired vertical Shorts feed
- Video Watch screen with player controls and comments
- Scholar Channel profiles
- Library with playlists, watch history, saved videos
- Live streaming screen with chat
- Scholar video upload flow
- Full auth (login/register) flow
- Dark/light theme toggle

## User preferences

- Blue (#2563EB) primary brand color
- Light mode default, dark mode supported
- Islamic design elements (crescent moon logo, geometric patterns)
- No emojis anywhere in the UI
- Icon buttons preferred over text buttons

## Gotchas

- Uses expo-image for all image rendering (not React Native's Image)
- useAnimatedStyle must never be called inside .map() — extract to component
- Web safe area: 67px top, 84px bottom tab bar
- Django video status must be "approved" to appear in the API (not "published")
- Scholar list API uses `.scholars` key, not `.results` — handled in scholarsApi.list()
- Metro proxy only pipes request body for non-GET/HEAD requests

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
