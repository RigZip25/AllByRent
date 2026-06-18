# AGENTS.md

## Cursor Cloud specific instructions

This is a frontend-only Vite + React + TypeScript app (no backend, no database). All auth is localStorage-based demo functionality.

### Key commands

See `package.json` scripts and `README.md` for details:

- **Dev server:** `npm run dev` → serves on `http://localhost:5173/`
- **Lint:** `npm run lint`
- **Build:** `npm run build` (runs `tsc -b && vite build`)
- **Preview production build:** `npm run preview`

### Navigating the app

The app supports URL query parameters to jump to specific screens (useful for testing):
- `?screen=splash` — static layout preview (art + copy), no auto-advance
- `?screen=splash&dynamic=1` — animated splash preview, no auto-advance
- `?screen=splash&art=1` — PNG only (`evorios_splash_garage.png`)
- `?resetApp=1` — wipe local data + PWA cache, then reload (fresh splash + onboarding)
- `?screen=login`, `?screen=signup`, `?screen=verification-phone`, `?screen=verification-code`, `?screen=reset-password`, `?screen=create-new-password`, `?screen=like-to-do-rent`, `?screen=like-to-do-list`, `?screen=rental`, `?screen=earning-your-stuff`
- `?step=0` through `?step=15` for step-based navigation

### Notes

- No automated test framework is configured. Validate changes via lint, build, and manual testing.
- Node.js 22 is the expected runtime (per CI config).
- The app uses vanilla CSS (no CSS framework).

### Deploy (required for agents)

Production: **https://app.allbyrent.com** (Vercel, auto-deploy on push to `main`).

After fixes are built and tested, **merge the PR to `main` yourself** — do not leave deploy to the user.

1. `npm run build` (and `npm run lint` when relevant files changed)
2. Push branch, open/update PR, wait for Vercel preview check if present
3. `gh pr ready <n>` if draft, then `gh pr merge <n> --merge`
4. Confirm production picked up the deploy (new `assets/index-*.css` hash on app.allbyrent.com)
5. Tell the user to hard-refresh or open `?resetApp=1` if they still see old UI (PWA cache)
