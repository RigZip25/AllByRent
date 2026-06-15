# Evorios — brand, product & repo guide

**Last updated:** 2026-05-28  
**Purpose:** Single source of truth when continuing work from any machine (Windows, Mac, Cloud Agent). Track the evolution of **Evorios** here; update this file when brand or product decisions change.

---

## Company & domain

| Item | Value |
|------|--------|
| **Consumer brand** | **Evorios** (site, app, mascot — one name) |
| **Domain** | **evorios.com** (owned) |
| **Legal entity** | Wyoming-registered company (use legal name on contracts, Stripe, Vercel billing) |
| **Repo** | https://github.com/RigZip25/AllByRent.git |
| **Codebase name (legacy)** | `allbyrent` in `package.json` — rebrand to Evorios in progress |

**Pronunciation (US):** *eh-VOR-ee-ohs* — use consistently in copy and onboarding.

---

## Brand core — evolution narrative

Evorios is not “another marketplace.” It is the **evolution of the household** in three layers:

1. **Evolution of household thinking** — from “stuff in the garage” to “my home is a shop.”
2. **Evolution of consumption** — buy new vs. borrow, buy used, rent for a weekend, pass things along — in one place.
3. **Evolution of relationships** — anonymous commerce → neighbors, porch, yard, trust on the block.

**One-liner:** *Evorios — evolve how your home shares.*

**Mascot:** **Evorios** (same name as the product). Not a separate character name. Friendly neighbor-guide; green jacket visual (evolve from legacy Mr. Rentano art). Voice: warm, yard-sale practical, never corporate “AI assistant.”

**Naming rules**

- Do **not** put *sale*, *rent*, or *gift* in the **brand** name (fine inside product modes).
- Avoid **Mano** / **ManoYard** / **HomeMano** — too close to [ManoMano](https://www.manomano.com) (EU DIY marketplace).
- Legacy names in code: **AllByRent**, **Rentano** → replace over time (see [Rebrand checklist](#rebrand-checklist)).

---

## Product metaphor

**Garage Showcase** — each household runs a vitrina on the block. Full task map: **[GARAGE_SHOWCASE.md](GARAGE_SHOWCASE.md)**.

**Listing modes (code):** borrow · sell · rent-to-own · gift.  
**Home UI labels:** **My Garage** / **Browse** (internal keys `earn` / `rent`).

---

## Repository state (engineering)

### Branches

| Branch | Status | Notes |
|--------|--------|--------|
| **`main`** | Production baseline | Commit `6cacc9a` — agent API, share cards, identity, QR, chat, push, Supabase migrations `001`–`020`, etc. |
| **`cursor/stripe-renter-payment-ca09`** | **Not merged** | Tasks 15–18: Stripe Elements booking pay, manual-capture deposit, no-show & overdue cron + Edge Functions. Draft PR [#16](https://github.com/RigZip25/AllByRent/pull/16). |
| **`cursor/magic-link-cross-tab-sync-ca09`** | Merged into `main` | Old local checkout may still point here — use `main` or stripe branch. |

### Clone & run (Windows or any PC)

```bash
git clone https://github.com/RigZip25/AllByRent.git
cd AllByRent
git checkout main
git pull origin main

# Optional: payments work
git fetch origin cursor/stripe-renter-payment-ca09
git checkout cursor/stripe-renter-payment-ca09

npm ci
npm run dev
```

App dev server: http://localhost:5173/

**Node:** 20+ (22 in CI). **Package manager in repo:** npm (`package-lock.json`).

### Key commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev |
| `npm run build` | Production build |
| `npm run lint` | ESLint on `src/` |

See also `AGENTS.md`, `README.md`, `DEPLOY.md`.

---

## What is done vs. not done

### Done on `main`

- Auth: magic link, cross-tab sync, Google/Apple OAuth, passkeys
- Supabase: listings, rentals, profiles, requests, notifications, reviews, disputes, messages, boost fields
- Listing wizard (7 steps), PhotoRoom via `/api/photoroom`, Claude analysis
- Booking flow, host dashboard, search, disputes, reviews, active rental UI
- Web push, realtime rental chat, QR PDFs, verification photo → active listing
- Safely **estimate** + `/api/safely/quote` (not full Safely integration)
- Stripe Connect **fields** + profile UI stub; Stripe Identity **session** API (UI stub)
- Share cards (3 formats), agent API + orchestrator scaffolding (`020` migration)
- Subscription **limits** (localStorage plans)

### On branch `cursor/stripe-renter-payment-ca09` only (merge pending)

- **Task 15:** Stripe Elements renter payment, `POST /api/stripe/payment_intent`, `stripe_customer_id` on profiles
- **Task 16:** Deposit hold — `capture_method: manual`; cancel = release, capture = claim
- **Task 17:** No-show automation (T+30m renter nudge, T+60m cancel + 1-day fee attempt)
- **Task 18:** Overdue automation (T+1h late fee ×1.5, T+24h owner recovery, T+48h Safely escalation notice)
- Migrations **`021`**, **`022`** (deposit deadline + automation timestamps)
- Vercel cron: `/api/cron/rental-no-show`, `/api/cron/rental-overdue` (`CRON_SECRET`)
- Supabase Edge Functions: `supabase/functions/rental-no-show`, `rental-overdue`

### Not done (backlog)

| Area | Notes |
|------|--------|
| **Evorios rebrand** | Strings, manifest, Rentano → Evorios, `evorios.com` deploy |
| **Task 28** | SMS OTP (Twilio) |
| **Task 30** | Server QR + HMAC `/api/qr` |
| **Task 31** | RLS audit migration |
| **Task 32** | Co-hosts full Supabase + email flow (UI is localStorage today) |
| **Task 34–35** | Host analytics dashboard, admin panel (`is_admin`) |
| **Stripe boost checkout** | `/api/stripe/boost` still placeholder |
| **Stripe Billing** | Real subscription billing (plans are local today) |
| **Full Safely** | Policy binding beyond quote stub |

---

## Environment variables (Vercel / `.env.local`)

Copy from `.env.example`. Minimum for real auth + data:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

**Stripe (after merging PR #16):**

```env
STRIPE_SECRET_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
CRON_SECRET=
```

**Other (as needed):**

```env
ANTHROPIC_API_KEY=
PHOTOROOM_API_KEY=
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VITE_VAPID_PUBLIC_KEY=
AGENT_API_KEY=
```

Webhook endpoint (production): `https://<your-domain>/api/stripe/webhook` — events: `payment_intent.*`, `identity.verification_session.*`.

---

## Supabase migrations

Run in order in Supabase SQL editor (or CLI). On `main`: **001–020**. After merging stripe branch add **021**, **022**.

| Migration | Topic |
|-----------|--------|
| 001–008 | Profiles, co-hosts table, trust |
| 005–007 | Listings, city |
| 006 | Rentals |
| 009–012 | Requests, notifications, reviews, disputes |
| 013–015 | Stripe Connect, rental payment fields, stripe_customer_id |
| 016–019 | Push, messages, boost, verification photo |
| 020 | Agent / orchestrator tables |
| **021** | `deposit_claim_deadline_at` (stripe branch) |
| **022** | No-show / overdue automation timestamps (stripe branch) |

---

## Rebrand checklist

When executing Evorios rebrand in code:

- [ ] `package.json` name / description
- [ ] `public/manifest.webmanifest`, `index.html`, PWA icons → Evorios
- [ ] `src/lib/brand.ts`, theme greens (can keep `#0D5C3A` or refresh)
- [ ] Rename Rentano → Evorios: `rentanoPrompt.ts`, `RentanoChat`, FAQ, components, onboarding copy
- [ ] `README.md`, `PROJECT_CONTEXT.md`, `DEPLOY.md`
- [ ] Vercel project + custom domain **evorios.com**
- [ ] Stripe / Supabase dashboard display name (Wyoming legal entity)
- [ ] App Store listing name **Evorios** (when ready)
- [ ] Update this doc with “rebrand completed” date

---

## Suggested next steps (priority)

1. **Merge PR #16** (or rebase stripe branch on latest `main`) → deploy → add Stripe + `CRON_SECRET` → run migrations 021–022.
2. **Register evorios.com** on Vercel; point DNS; smoke-test PWA.
3. **Rebrand pass** (strings + manifest + mascot copy) — branch e.g. `cursor/evorios-rebrand-ca09`.
4. **Landing** on evorios.com: hero + three “evolution” pillars + CTA to app.
5. Backlog: 28, 30–32, 34–35 per product priority.

---

## Evolution log

Add a row when something meaningful ships or brand decisions change.

| Date | Change |
|------|--------|
| 2026-06-15 | **Garage Showcase** direction; P1 rebrand on `cursor/evorios-rebrand-ca09` (brand.ts, splash Evorios, My Garage / Browse). |
| 2026-05-28 | Brand: **Evorios** = site + mascot; evolution narrative. Wyoming company. |

---

## Quick links

- **GitHub:** https://github.com/RigZip25/AllByRent
- **PR (payments):** https://github.com/RigZip25/AllByRent/pull/16
- **Domain:** https://evorios.com
- **Legacy deploy docs:** `DEPLOY.md` (update hostnames to evorios.com when cut over)

---

*Maintainers: append to **Evolution log** and bump **Last updated** when you merge major work or change brand rules.*
