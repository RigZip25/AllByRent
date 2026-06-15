  # AllByRent → Evorios (rebrand in progress)

  > **Brand & tasks:** [docs/EVORIOS.md](docs/EVORIOS.md) · **Garage Showcase:** [docs/GARAGE_SHOWCASE.md](docs/GARAGE_SHOWCASE.md) · **Flow audit:** [docs/FLOW_AUDIT.md](docs/FLOW_AUDIT.md)

  This is a code bundle for the Evorios PWA (legacy Figma: AllByRent Mobile App UI).

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

## AI API keys (Anthropic + PhotoRoom)

API keys stay **server-side**. The app calls `/api/anthropic` and `/api/photoroom`; Vercel serverless functions proxy to the upstream APIs.

**Vercel (production):** Project → Settings → Environment Variables:

- `ANTHROPIC_API_KEY`
- `PHOTOROOM_API_KEY`

**Local dev (`npm run dev`):** Add the same keys to `.env.local` (see `.env.example`). Vite proxies `/api/*` and injects the key on the dev server only.

For full parity with production handlers, you can also run `npx vercel dev`.

## Supabase Auth (email + custom WebAuthn passkeys)

This app can run in **demo mode** if Supabase env vars are missing. To enable real auth, set:

- **`VITE_SUPABASE_URL`**
- **`VITE_SUPABASE_ANON_KEY`**

**Vercel (passkey API routes)** — Project → Settings → Environment Variables:

- `SUPABASE_SERVICE_ROLE_KEY` — mints sessions after passkey verify (never expose to the client)
- `PASSKEY_RP_ID` — e.g. `app.allbyrent.com` (production) or `localhost` (local)
- `PASSKEY_ORIGIN` — e.g. `https://app.allbyrent.com` or `http://localhost:5173`
- `PASSKEY_SECRET` — random string for signing WebAuthn challenges (optional; falls back to service role key)

Create a `.env.local` file in the project root:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Database: `profiles` table

Run the migration in Supabase SQL editor (or CLI):

`supabase/migrations/001_profiles.sql`

Stores `passkey_credential_id` and public key material for custom WebAuthn (no Supabase Pro passkey add-on).

### Supabase dashboard setup

- **Auth → URL Configuration**
  - **Site URL**: `https://app.allbyrent.com` (prod) or `http://localhost:5173` (dev)
  - **Redirect URLs**: `https://app.allbyrent.com/**`, `http://localhost:5173/**`

### Troubleshooting “Failed to fetch” on magic link

1. Copy **Project URL** from Supabase → **Settings → API** (not a random UUID from General).
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel for **Production**, then **redeploy** (Vite bakes env vars at build time).
3. Ensure the Supabase project is **active** (resume if paused). If `https://YOUR_REF.supabase.co` does not resolve in a browser, fix the project in Supabase before redeploying.
4. The app falls back to `POST /api/auth/otp` when the browser cannot reach Supabase directly; that route returns a clearer error if the hostname is wrong.
- **Auth → Providers**
  - **Email** enabled (magic link + 8-digit OTP)
  - Google / Apple optional later (UI shows “Coming soon”)

### Local passkey testing

Passkey routes live under `/api/passkey/*` (Vercel serverless). Use:

```bash
npx vercel dev
```

Plain `npm run dev` works for email auth; passkey register/login needs `vercel dev` (or production deploy).

### Troubleshooting Face ID / passkeys (iOS Safari & PWA)

1. **Vercel env (Production)** — set `PASSKEY_RP_ID=app.allbyrent.com` and `PASSKEY_ORIGIN=https://app.allbyrent.com` (no trailing slash). Also set `SUPABASE_SERVICE_ROLE_KEY` so `/api/passkey/*` can run.
2. **Same URL every time** — register and sign in on the same origin (`https://app.allbyrent.com`). Avoid `www`, preview URLs, or opening the installed PWA on a different hostname than where you enrolled.
3. **Safari vs home-screen app** — both use the same origin if installed from that site; if Face ID fails after install, sign in with email once, then re-enable Face ID.
4. **User cancelled** — dismissing the system sheet is not an error; try again.
5. **API errors** — test `POST https://app.allbyrent.com/api/passkey/auth/options` with `{}`; it should return **200** and JSON (not `FUNCTION_INVOCATION_FAILED`). If 500, check Vercel function logs and env vars.

### Notes

- **Account deletion**: requires a Supabase Edge Function with the service role key; the UI signs out locally as a placeholder.

## Production deploy & stale UI

Vercel injects `VERCEL_GIT_COMMIT_SHA` at build time. The app shows a **build stamp** at the bottom of **Profile** (e.g. `Build f3994e1 · …`) so you can confirm what shipped without guessing bundle hashes.

If `app.allbyrent.com` looks old after a green deploy:

1. **Profile → build stamp** — should match the latest commit on `main` (first 7 chars of the SHA).
2. **Hard refresh** the tab, or open the site in a private window.
3. **`?resetApp=1`** — clears local data, unregisters the service worker, and reloads (use when the PWA still serves an old precache).
4. **Vercel** — if the stamp never updates, redeploy with **Clear build cache** enabled (Project → Deployments → … on a deployment, or redeploy from the latest commit).

`vercel.json` sets `Cache-Control: no-cache` on `/`, `/index.html`, `/sw.js`, and `/workbox-*.js` so the CDN does not serve a stale app shell. Hashed assets under `/assets/*` remain long-cache safe.
  