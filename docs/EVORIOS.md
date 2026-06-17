# Evorios — brand, product & repo guide

**Last updated:** 2026-06-15

**Purpose:** Single source of truth when continuing work from any machine (Windows, Mac, Cloud Agent). Track the evolution of **Evorios** here; update this file when brand or product decisions change.

**Walk the app screen-by-screen:** [FLOW_AUDIT.md](FLOW_AUDIT.md) — what to change at each step (✅ / 🟡 / 🟠 / 🔴).

**Master reshape brief (10 tasks):** [EVORIOS_CURSOR_BRIEF.md](EVORIOS_CURSOR_BRIEF.md) · [status tracker](EVORIOS_RESHAPE_STATUS.md)

---

## Company & domain

| Item | Value |
|------|--------|
| **Consumer brand** | **Evorios** (site, app, mascot — one name) |
| **Domain** | **evorios.com** (owned) |
| **Legal entity** | Wyoming-registered company (use legal name on contracts, Stripe, Vercel billing) |
| **Repo** | https://github.com/RigZip25/AllByRent.git |
| **Codebase name** | `evorios` in `package.json` (legacy localStorage keys: `allbyrent_*`) |

**Pronunciation (US):** *eh-VOR-ee-ohs* — use consistently in copy and onboarding.

---

## Brand core — evolution narrative

Evorios is not “another marketplace.” It is the **evolution of the household** in three layers:

1. **Evolution of household thinking** — from “stuff in the garage” to “my home is a shop.”
2. **Evolution of consumption** — buy new vs. borrow, buy used, rent for a weekend, pass things along — in one place.
3. **Evolution of relationships** — anonymous commerce → neighbors, porch, yard, trust on the block.

**One-liner:** *Evorios — evolve how your home shares.*

**Mascot:** **Mr. Evorios** (Мистер Эвориус) — same character as legacy Rentano art; green jacket, neighbor-guide voice.

**Naming rules**

- Do **not** put *sale*, *rent*, or *gift* in the **brand** name (fine inside product modes).
- Avoid **Mano** / **ManoYard** / **HomeMano** — too close to [ManoMano](https://www.manomano.com) (EU DIY marketplace).
- Legacy names in code: **AllByRent**, **Rentano** → replace over time (see [Rebrand checklist](#rebrand-checklist)).

---

## Product metaphor

**Garage Showcase** — each household runs a vitrina on the block. Full task map: **[GARAGE_SHOWCASE.md](GARAGE_SHOWCASE.md)**.

**Listing modes (target):** Rent · Sell · Gift. RTO removed from UI (enum kept in types for Stage 2).

**Home UI labels:** **My Garage** / **Browse** (internal keys `earn` / `rent`).

---

## Repository state (engineering)

### Branches

| Branch | Status | Notes |
|--------|--------|--------|
| **`main`** | Production baseline | Merged: agent API, share cards, Stripe tasks 15–18 (PR #16), Evorios docs (PR #17), rebrand + garage splash (PR #18). |
| **`cursor/stripe-renter-payment-ca09`** | Merged | Tasks 15–18: Stripe Elements, deposit hold, no-show & overdue cron. |
| **`cursor/evorios-rebrand-ca09`** | Merging to `main` | P1 rebrand, garage-door splash, `brand.ts`, FLOW_AUDIT. |

### Clone & run (Windows or any PC)

```bash
git clone https://github.com/RigZip25/AllByRent.git
cd AllByRent
git checkout main
git pull origin main

npm ci
npm run dev
```

App dev server: http://localhost:5173/

**Test splash:** http://localhost:5173/?screen=splash

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
- **Tasks 15–18:** Stripe Elements payment, deposit hold, no-show & overdue automation (migrations `021`, `022`)
- **P1 rebrand:** `brand.ts`, Evorios strings, garage-door splash, My Garage / Browse labels

### Not done (backlog)

| Area | Notes |
|------|--------|
| **Evorios rebrand (full)** | Onboarding assets, Rentano component renames, share PDFs, feed as neighborhood garages |
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

**Stripe:**

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

Run in order in Supabase SQL editor (or CLI). On `main`: **001–022**.

| Migration | Topic |
|-----------|--------|
| 001–008 | Profiles, co-hosts table, trust |
| 005–007 | Listings, city |
| 006 | Rentals |
| 009–012 | Requests, notifications, reviews, disputes |
| 013–015 | Stripe Connect, rental payment fields, stripe_customer_id |
| 016–019 | Push, messages, boost, verification photo |
| 020 | Agent / orchestrator tables |
| 021 | `deposit_claim_deadline_at` |
| 022 | No-show / overdue automation timestamps |

---

## Rebrand checklist

When executing Evorios rebrand in code:

- [x] `package.json` name / description
- [x] `public/manifest.webmanifest`, `index.html` → Evorios
- [x] `src/lib/brand.ts`, theme greens
- [x] Splash → garage-door animation + Evorios title
- [ ] PWA icons → new Evorios art
- [ ] Rename Rentano → Evorios: components, FAQ, onboarding copy + assets
- [ ] `PROJECT_CONTEXT.md`, `DEPLOY.md` hostnames → evorios.com
- [ ] Vercel project + custom domain **evorios.com**
- [ ] Stripe / Supabase dashboard display name (Wyoming legal entity)
- [ ] App Store listing name **Evorios** (when ready)

---

## Suggested next steps (priority)

1. **Onboarding pass** (A3–A5 in FLOW_AUDIT): garage copy + new assets.
2. **Landing** on evorios.com: hero + three “evolution” pillars + CTA to app.
3. **P2 feed:** neighborhood garage cards.
4. Backlog: 28, 30–32, 34–35 per product priority.

---

## Evolution log

Add a row when something meaningful ships or brand decisions change.

| Date | Change |
|------|--------|
| 2026-06-15 | **Garage Showcase** direction; P1 rebrand + garage-door splash merged to `main`. |
| 2026-05-28 | Brand: **Evorios** = site + mascot; evolution narrative. Wyoming company. This doc added. |
| 2026-05-28 | Engineering: tasks 15–18 merged (PR #16). |

---

## Quick links

- **GitHub:** https://github.com/RigZip25/AllByRent
- **Domain:** https://evorios.com
- **Legacy deploy docs:** `DEPLOY.md` (update hostnames to evorios.com when cut over)

---

*Maintainers: append to **Evolution log** and bump **Last updated** when you merge major work or change brand rules.*
