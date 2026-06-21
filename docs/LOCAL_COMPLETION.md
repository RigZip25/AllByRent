# Local completion checklist

Everything in this document is **code in the repo**. When these items are done, the only remaining work is external setup (Supabase project, Stripe Dashboard, Vercel env, DNS).

---

## Done in repo (this branch)

| Area | Status |
|------|--------|
| Production gate (`SetupRequiredScreen` — no Supabase = blocked) | Done |
| Garage commerce migration `023_garage_commerce.sql` | Done |
| Garage domain migration `024_garage_domain.sql` | Done |
| Garage Supabase sync (`garageSupabaseSync.ts`, `garageRepository.ts`) | Done |
| Bids, offers, lot states, schedules, prefs, follows — read + write | Done |
| Stripe garage cart / auction checkout + webhook sold-state | Done |
| Listing boost API (`api/stripe/boost.ts`) + webhook `listing_boost` | Done |
| Connect onboarding + webhook `account.updated` | Done |
| Co-host remote sync (`coHostSupabaseSync.ts`, `coHostRepository.ts`) | Done |
| Repositories: payments, connect, garage, coHost | Done |
| Integration status screen + `.env.example` | Done |

---

## External steps (do in order)

### Step 1 — Supabase

1. Create or open your Supabase project.
2. Run all migrations in `supabase/migrations/` (including **023** and **024**).
3. Copy **Project URL** and **anon key** → Vercel env:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Copy **service role key** → Vercel only:
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Enable Auth providers you need (magic link, OAuth, passkeys per existing config).

**Verify:** App loads past setup screen; sign-in works.

---

### Step 2 — Stripe (test mode first)

1. Create Stripe account (test mode).
2. Set Vercel env:
   - `VITE_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
3. Create Products / Prices only if you add new paid SKUs later (listing boost uses PaymentIntents, not Price IDs).
4. Add webhook endpoint:
   - URL: `https://<your-domain>/api/stripe/webhook`
   - Events: `payment_intent.*`, `account.updated`, Identity events if used
   - Copy signing secret → `STRIPE_WEBHOOK_SECRET`

**Verify:** Profile → Integration status shows Stripe green; garage cart pays with test card `4242…`.

---

### Step 3 — Vercel deploy + DNS

1. Merge PR to `main` (or deploy preview branch).
2. Set all env vars from `.env.example` on the Vercel project (`PASSKEY_RP_ID=app.evorios.com`, `PASSKEY_ORIGIN=https://app.evorios.com`).
3. Point DNS:
   - **App (PWA):** `app.evorios.com` → Vercel
   - **Marketing site:** `evorios.com` → your web host (separate from the PWA)
4. Redeploy after env and DNS changes.

**Verify:** `npm run build` passed in CI; `https://app.evorios.com` loads the app.

---

### Step 4 — Smoke tests (production URL)

| Flow | What to check |
|------|----------------|
| Rental booking | PaymentIntent + rental row updated |
| Garage buy-now cart | Order paid + lot `sold` in Supabase |
| Auction winner pay | `garage_auction_payments` paid + lot sold |
| Listing boost | Payment succeeds + `listings.boosted_until` set |
| Host plan upgrade | N/A — all hosts list for free |
| Connect bank | Onboarding URL → payouts flag on profile |
| Co-host invite | Row in `co_hosts` after invite on signed-in host |

---

### Step 5 — Push notifications (optional launch+)

1. Generate VAPID keys → `VITE_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
2. Add Supabase trigger: new listing → fan-out to `garage_follows` → `api/push/send`

See `docs/LAUNCH_READINESS.md` for push fan-out details.

---

### Step 6 — Post-launch (not blocking)

- Agent orchestrator APIs (`api/agent/*`) — scaffolding only
- Co-host invite email delivery
- Business plan sales-assisted billing

---

## Merge order for open PRs

Recommended merge sequence into `main`:

1. Garage fixes / share deep links (#45–47) if still open
2. Integration layer (#48)
3. Remove demo + garage sync (#49 — this branch)

Then Vercel auto-deploys from `main`.
