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

## Common failure (fixed)

`package-lock.json` must match `package.json`. CI uses `npm ci`; a stale lockfile causes **Install dependencies** to fail.
