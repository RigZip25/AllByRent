# Integration handoff — Evorios

This document lists what is **already wired in the UI and API** and what you need to **connect in production** (Supabase, Stripe, push).

For a step-by-step external checklist after code is merged, see **`docs/LOCAL_COMPLETION.md`**.

**Host listings are free with no plan limits.** Stripe is used for rentals, garage checkout, listing boosts, and Connect payouts — not subscriptions.

---

## Architecture

```
Screens → repositories (garage, payments, connect, coHost)
       → local cache + *SupabaseSync modules
       → Supabase (when env vars are set)
       → Stripe API routes → webhook
```

**Production builds require Supabase.** Payments require Stripe + signed-in user. There is no demo checkout or fake booking data.

---

## 1. Supabase

### Env vars

| Variable | Where |
|----------|--------|
| `VITE_SUPABASE_URL` | Vercel + `.env.local` |
| `VITE_SUPABASE_ANON_KEY` | Vercel + `.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel only (server routes) |

### Migrations (run all in order)

| Migration | Purpose |
|-----------|---------|
| Existing `001`–`022` | Auth, profiles, listings, rentals, messages, … |
| `023_garage_commerce.sql` | `garage_orders`, `garage_order_lines`, `garage_auction_payments`, `garage_follows` |
| `024_garage_domain.sql` | `garage_bids`, `garage_neighbor_offers`, `garage_lot_states`, `garage_sale_schedules`, `garage_sale_offer_prefs` |
| `002_co_hosts.sql` | Co-host invites (already in repo) |

### Client sync modules

- `src/lib/garage/garageSupabaseSync.ts` — garage domain tables
- `src/lib/coHost/coHostSupabaseSync.ts` — co-host rows
- `src/lib/repositories/garageRepository.ts` — screen-facing garage API
- `src/lib/repositories/coHostRepository.ts` — co-host invite/accept/remove

---

## 2. Stripe

### Env vars

| Variable | Purpose |
|----------|---------|
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe Elements (cart, auction, rentals, boost) |
| `STRIPE_SECRET_KEY` | All `/api/stripe/*` routes |
| `STRIPE_WEBHOOK_SECRET` | `api/stripe/webhook.ts` |

### API routes

| Route | Used by |
|-------|---------|
| `POST /api/stripe/payment_intent` | Rental booking |
| `POST /api/stripe/deposit_intent` | Rental deposit hold |
| `POST /api/stripe/garage_checkout` | Garage cart PaymentIntent + order rows |
| `POST /api/stripe/auction_checkout` | Auction winner pay |
| `POST /api/stripe/boost` | Listing boost PaymentIntent |
| `POST /api/stripe/connect_account_link` | Host payout onboarding |
| `POST /api/stripe/webhook` | Payments, boosts, Connect |

### Webhook metadata

| `payment_type` | Action |
|----------------|--------|
| `garage_cart` | Mark order paid; upsert `garage_lot_states` from order lines |
| `garage_auction` | Mark auction payment paid; upsert sold lot state |
| `listing_boost` | Set `listings.boosted_until` / `boosted_tier` |
| `rental` / `deposit` | Update rental payment fields |
| `account.updated` | Sync `stripe_payouts_enabled` on profile |

---

## 3. Stripe Connect

**UI:** Profile → Connect bank account

Express account + onboarding link; webhook syncs payout status to `profiles`.

---

## 4. Push notifications

| Variable | Purpose |
|----------|---------|
| `VITE_VAPID_PUBLIC_KEY` | Client subscribe |
| `VAPID_PRIVATE_KEY` | `api/push/send.ts` |
| `VAPID_SUBJECT` | mailto: contact |

After deploy: add DB trigger on new listings → push followers (`garage_follows` with prefs). Not required for core commerce.

---

## 5. In-app integration checklist

**More → Integrations** or **Profile → Integration status** reflects client-detectable env vars (`integrations.ts`, `production.ts`).

---

## 6. Deploy checklist

1. Merge integration + production PRs to `main`
2. Set env vars on Vercel (see `.env.example`)
3. Run Supabase migrations **023** and **024**
4. Configure Stripe webhook → `https://app.evorios.com/api/stripe/webhook`
5. Smoke-test flows listed in `docs/LOCAL_COMPLETION.md`

---

## Intentionally deferred

- Agent orchestrator (`api/agent/*`, `api/orchestrator/run.ts`) — post-launch
- Co-host transactional email
- Push fan-out DB triggers (code path exists; trigger is ops)
