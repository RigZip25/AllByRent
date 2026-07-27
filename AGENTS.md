# AGENTS.md

## Cursor Cloud specific instructions

This is a frontend-only Vite + React + TypeScript PWA: **MyFantasticTrip** (myfantastictrip.com). Demo state is localStorage/Zustand; Supabase schema is prepared for later backend wiring.

### Key commands

- **Dev server:** `npm run dev` → `http://localhost:5173/`
- **Lint:** `npm run lint`
- **Build:** `npm run build`
- **Typecheck:** `npm run typecheck`
- **Preview:** `npm run preview`

### Navigating the app

- `/welcome` → onboarding interests → profile → home
- `/` home · `/explore` map · `/destination/:id`
- `/trip/create` AI voice/text · `/trip/:id` overview · `/booking` · `/packing` · `/group` · `/countdown`
- `/trip/:id/live` · `/restaurants` · `/translator` · `/summary` · `/memories`
- `/wishlist` · `/profile`
- `?reset` / `?resetApp=1` — wipe demo local data

### Notes

- No automated test framework. Validate via lint, build, and manual testing.
- Node.js 22 expected.
- Design: dark theme (`#0a0a0c`), amber/gold accents, DM Sans, 390px phone shell.
- Map uses a styled dark canvas with destination dots (Mapbox optional via env later).
- AI trip matching runs client-side with curated destinations; Claude API can be wired via `/api/anthropic`.

### Deploy

After fixes are built and tested, merge the PR to `main` yourself.

1. `npm run build` (and `npm run lint` when relevant)
2. Push branch, open/update PR
3. Merge when ready
4. Hard-refresh or `?resetApp=1` if PWA cache shows old UI
