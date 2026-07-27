# AGENTS.md

## Cursor Cloud specific instructions

This is a frontend-only Vite + React + TypeScript app (no backend, no database). All auth is localStorage-based demo functionality.

### Key commands

See `package.json` scripts and `README.md` for details:

- **Dev server:** `npm run dev` → serves on `http://localhost:5173/`
- **Lint:** `npm run lint`
- **Build:** `npm run build` (Vite production bundle; Vercel uses this)
- **Typecheck:** `npm run typecheck` (`tsc -b` — not yet gated on build; fix debt before requiring it)
- **Preview production build:** `npm run preview`

### Navigating the app

Useful query params (wired in `App.tsx` / `deepLinks.ts`):
- `?screen=splash` — splash preview (`&dynamic=1`, `&art=1`)
- `?skipInstall=1` — skip the Home Screen install gate (browser testing)
- `?screen=browseHub|home|mre|garage|more|listItem|snapSale|identity|coHosts`
- `?listingId=` / `/item/:id` — item detail (or garage shop for sell listings)
- `?garage=` — neighbor garage shop
- `?reset` / `?resetApp=1` — wipe local data
- Auth is modal `AuthGate` (email OTP) — there is no `?screen=login` / signup stack
- `?step=` is **not** wired (listing wizard is in-app steps, not URL steps)

### Notes

- No automated test framework is configured. Validate changes via lint, build, and manual testing.
- Node.js 22 is the expected runtime (per CI config).
- The app uses vanilla CSS (no CSS framework).

### Deploy (required for agents)

Production: **https://app.evorios.com** (Vercel, auto-deploy on push to `main`). Marketing site: **https://evorios.com**.

After fixes are built and tested, **merge the PR to `main` yourself** — do not leave deploy to the user.

1. `npm run build` (and `npm run lint` when relevant files changed)
2. Push branch, open/update PR, wait for Vercel preview check if present
3. `gh pr ready <n>` if draft, then `gh pr merge <n> --merge`
4. Confirm production picked up the deploy (new `assets/index-*.css` hash on app.evorios.com)
5. Tell the user to hard-refresh or open `?resetApp=1` if they still see old UI (PWA cache)
