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

## Production env (before Stripe)

Set in Vercel **Settings → Environment Variables** (Production), then **Redeploy**:

| Variable | Required for |
|----------|----------------|
| `VITE_SUPABASE_URL` | Client auth + data |
| `VITE_SUPABASE_ANON_KEY` | Client auth + data |
| `SUPABASE_SERVICE_ROLE_KEY` | Delete account, cron, passkeys, Stripe API |
| `CRON_SECRET` | `/api/cron/*` (generate: `openssl rand -hex 32`) |
| `PASSKEY_RP_ID` | `app.evorios.com` on production |
| `PASSKEY_ORIGIN` | `https://app.evorios.com` |

Cron schedules are in `vercel.json` (`rental-pending-expiry` hourly; no-show & overdue every 15 min). Vercel sends `Authorization: Bearer <CRON_SECRET>` automatically when `CRON_SECRET` is set.

Verify cron after deploy:

```bash
curl -s -H "Authorization: Bearer YOUR_CRON_SECRET" \
  "https://YOUR_PRODUCTION_HOST/api/cron/rental-pending-expiry"
```

Expect: `{"ok":true,"expired":0}` (or a positive `expired` count).

## Common failures

### `FUNCTION_INVOCATION_FAILED` on every `/api/*` route (except `/api/og/image`)

The root `package.json` sets `"type": "module"` for Vite. Without an override, Vercel’s Node builder may **not bundle** imports from `server/routes/` into each function — deploy succeeds but runtime crashes with `Cannot find module '/var/task/server/...'`.

**Fix:** `api/package.json` with `"type": "commonjs"` forces esbuild to inline the `server/` tree into each API function. After merging, **redeploy** on Vercel.

Smoke test (no auth → expect **401**, not 500):

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  "https://YOUR_PRODUCTION_HOST/api/cron/rental-pending-expiry"
```

### Hobby plan: 12 serverless functions max

Vercel Hobby allows **12 serverless functions per deployment**. Each file under `api/` counts as one.

This repo uses **12** grouped routers under `api/` (Hobby limit):

- `api/stripe/[...slug].ts`, `api/passkey/[...slug].ts`, `api/agent/[...slug].ts`
- `api/auth/[...slug].ts`, `api/geocode/[...slug].ts`, `api/cron/[...slug].ts`
- `api/push/[...slug].ts`, `api/safely/[...slug].ts`, `api/orchestrator/[...slug].ts`
- `api/proxy/[...slug].ts` (anthropic + photoroom), `api/link.ts`, `api/og/image.ts`

Handler code lives in `server/routes/`. Add new endpoints to the matching group router.

### Invalid `vercel.json` rewrites (fixed)

Regex in `has[].value` (e.g. bot `user-agent` matching) can fail deployment validation. Bot OG previews for `/link` are served via `/api/link` (same router). Social crawlers can use that URL directly.

### Stale lockfile

`package-lock.json` must match `package.json`. CI uses `npm ci`; a stale lockfile causes **Install dependencies** to fail.

### v0 project still on Next.js

If Vercel fails with Next.js build errors, the project may still be set up for **Next.js** from v0. This app is **Vite + React** (`dist/`).
