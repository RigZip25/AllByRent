# Deploy (GitHub Pages + Vercel)

## GitHub Pages (this repo)

- **URL:** https://rigzip25.github.io/AllByRent/
- **Workflow:** `.github/workflows/deploy.yml` on push to `main`
- **Build:** `npm ci` → `npm run build` with `GITHUB_PAGES=true` (asset base `/AllByRent/`)

Check status: [Actions](https://github.com/RigZip25/AllByRent/actions)

## Vercel (`v0-allbyrent-app-design`)

If Vercel fails, the project is often still set up for **Next.js** from v0. This app is **Vite + React** (`dist/`).

In Vercel project **Settings → General**:

| Setting | Value |
|--------|--------|
| Framework Preset | Vite |
| Root Directory | `.` (repo root) |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm ci` |

Or connect the GitHub repo **RigZip25/AllByRent** and import — `vercel.json` in the repo applies these settings.

**Node.js:** 20+ (see `package.json` `engines`).

## Common failures

### Hobby plan: 12 serverless functions max

Vercel Hobby allows **12 serverless functions per deployment**. Each file under `api/` counts as one.

This repo uses:
- `api/router.ts` — single router for all `/api/*` handlers (code lives in `server/routes/`)
- `api/og/image.tsx` — OG image edge function

Vercel rewrites `/api/*` (except `/api/og/image`) to `/api/router?route=...`.

If you add new API endpoints, register them in `api/router.ts` instead of creating new files under `api/`.

### Invalid `vercel.json` rewrites (fixed)

Regex in `has[].value` (e.g. bot `user-agent` matching) can fail deployment validation. Bot OG previews for `/link` are served via `/api/link` (same router). Social crawlers can use that URL directly.

### Stale lockfile

`package-lock.json` must match `package.json`. CI uses `npm ci`; a stale lockfile causes **Install dependencies** to fail.

### v0 project still on Next.js

If Vercel fails with Next.js build errors, the project may still be set up for **Next.js** from v0. This app is **Vite + React** (`dist/`).
