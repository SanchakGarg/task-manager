# TaskFlow

A bold, neurobrutalist task manager with Google Drive integration, smart reminders, and native apps for every platform.

**Live demo:** [taskflow.vercel.app](https://taskflow.vercel.app) · **Download:** [/download](https://taskflow.vercel.app/download)

---

## Stack

| Layer | Tech |
|-------|------|
| Web | Next.js 15 · React 19 · Tailwind CSS · Framer Motion |
| Auth | NextAuth v5 (Google OAuth) |
| Database | Neon PostgreSQL · Prisma ORM |
| Mobile | Expo SDK 52 · React Native · Expo Router |
| Desktop | Tauri 2 (Windows / macOS / Linux) |
| Monorepo | Turborepo · Bun workspaces |
| Deploy | Vercel (web) · GitHub Actions (native builds) |

---

## Project structure

```
taskmanager/
├── apps/
│   ├── web/          # Next.js web app (Vercel)
│   ├── mobile/       # Expo React Native app
│   └── desktop/      # Tauri desktop wrapper
├── packages/
│   ├── db/           # Prisma client + schema
│   └── types/        # Shared TypeScript types
└── .github/
    └── workflows/
        └── release.yml   # Builds desktop + Android on tag push
```

---

## Getting started

### Prerequisites

- [Bun](https://bun.sh) ≥ 1.1
- [Node.js](https://nodejs.org) ≥ 20 (for some tooling)
- A [Neon](https://neon.tech) PostgreSQL database
- A Google Cloud project with OAuth 2.0 credentials + Drive/Docs/Sheets APIs enabled

### 1. Clone & install

```bash
git clone https://github.com/SanchakGarg/task-manager.git
cd task-manager
bun install
```

### 2. Configure environment

Copy `.env.local.example` to `apps/web/.env.local` and fill in:

```env
# Database (Neon)
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
DIRECT_URL="postgresql://user:pass@host/db?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="generate-with: openssl rand -base64 32"

# Google OAuth
GOOGLE_CLIENT_ID="xxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxx"

# Web Push (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
VAPID_SUBJECT="mailto:you@example.com"

# Downloads page
GITHUB_REPO="SanchakGarg/task-manager"
```

Generate VAPID keys:
```bash
bunx web-push generate-vapid-keys
```

### 3. Set up the database

```bash
cd packages/db
bunx prisma db push
```

### 4. Run the web app

```bash
bun dev
# Open http://localhost:3000
# Click "Try Demo" to explore without logging in
```

### 5. Run desktop app (dev)

```bash
cd apps/desktop
bunx tauri dev   # requires Rust + system deps
```

### 6. Run mobile app (dev)

```bash
cd apps/mobile
bun start        # Expo Go on your phone or emulator
```

---

## Deploying to Vercel

1. Import the repo in [vercel.com/new](https://vercel.com/new)
2. Set **Root Directory** to `apps/web`
3. Set **Framework** to `Next.js`
4. Add all environment variables from `.env.local` (use production values)
5. Add a Vercel Cron Job:
   - Path: `/api/cron/reminders`
   - Schedule: `* * * * *`
   - Add header `Authorization: Bearer <CRON_SECRET>` and set `CRON_SECRET` env var

---

## Releasing desktop & mobile apps

Push a semver tag to trigger the GitHub Actions release pipeline:

```bash
git tag v1.0.0
git push origin v1.0.0
```

This builds:
- **Windows** — `.msi` installer
- **macOS** — `.dmg` universal (Apple Silicon + Intel)
- **Linux** — `.AppImage`
- **Android** — `.apk` (requires `EXPO_TOKEN` secret)

All artifacts are attached to the GitHub Release and shown on the `/download` page automatically.

### Required GitHub secrets / variables

| Name | Type | Description |
|------|------|-------------|
| `APP_URL` | Variable | Your Vercel URL, e.g. `https://taskflow.vercel.app` |
| `EXPO_TOKEN` | Secret | From [expo.dev](https://expo.dev) account settings |
| `TAURI_SIGNING_PRIVATE_KEY` | Secret | Optional — for Tauri updater signing |

---

## Google OAuth setup

1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create an OAuth 2.0 Client ID (Web application)
3. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-vercel-url.vercel.app/api/auth/callback/google`
4. Enable these APIs:
   - Google Drive API
   - Google Docs API
   - Google Sheets API

---

## Features

- **Task management** — Kanban board + list view, priorities, statuses, tags, due dates
- **Google integration** — Create/link Docs & Sheets per task, upload files to Drive
- **Reminders** — Set datetime reminders with push notifications (Web Push API)
- **Dark mode** — System-aware, toggle in Settings → Appearance
- **Demo mode** — Full dashboard accessible without login
- **Cross-platform** — Web, Windows, macOS, Linux, Android (iOS coming soon)

---

## License

MIT
