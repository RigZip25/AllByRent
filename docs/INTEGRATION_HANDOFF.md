# Integration handoff — Evorios / AllByRent

This document lists what is **already wired in the UI and API** and what you need to **connect in production** (Supabase, Stripe, subscriptions, push).

---

## Architecture

```
Screens (GarageCart, WinnerCheckout, Plans, Profile)
        ↓
Repositories (paymentsRepository, billingRepository, connectRepository)
        ↓
Client API helpers (stripePayments.ts)
        ↓
Vercel serverless (/api/stripe/*)
        ↓
Stripe + Supabase (when env vars are set)
```

Until env vars are set, the app runs in **demo mode** (localStorage + in-app notifications).

---

## 1. Supabase

### Env vars

| Variable | Where |
|----------|--------|
| `VITE_SUPABASE_URL` | Vercel + `.env.local` |
| `VITE_SUPABASE_ANON_KEY` | Vercel + `.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel only (server routes) |

### Already using Supabase

- Auth (magic link, OAuth, passkeys)
- `profiles` (incl. `stripe_customer_id`, `stripe_connect_account_id`)
- `listings`, `rentals`, messages, notifications tables (see existing migrations)

### Migrations still needed for garage commerce

Add tables (names are suggestions — align with your schema):

```sql
-- garage_orders: buy-now cart checkouts
-- garage_order_lines: line items per order
-- garage_auction_payments: auction winner payments
-- garage_bids: persisted bids (today: localStorage)
-- garage_follows: neighbor follow + push fan-out
```

Wire webhook handler in `api/stripe/webhook.ts` for:

- `payment_intent.succeeded` where `metadata.payment_type` is `garage_cart` or `garage_auction`
- `checkout.session.completed` where `metadata.subscription_plan_id` is set

---

## 2. Stripe

### Env vars

| Variable | Purpose |
|----------|---------|
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe Elements in cart, auction, rentals |
| `STRIPE_SECRET_KEY` | All `/api/stripe/*` routes |
| `STRIPE_WEBHOOK_SECRET` | `api/stripe/webhook.ts` |
| `STRIPE_PRICE_STARTER` | Subscription Checkout for Starter plan |
| `STRIPE_PRICE_PRO` | Subscription Checkout for Pro plan |

### API routes (ready)

| Route | Used by |
|-------|---------|
| `POST /api/stripe/payment_intent` | Rental booking |
| `POST /api/stripe/deposit_intent` | Rental deposit hold |
| `POST /api/stripe/garage_checkout` | Garage cart — creates PaymentIntent |
| `POST /api/stripe/auction_checkout` | Auction winner pay |
| `POST /api/stripe/connect_account_link` | Host payout onboarding (Express) |
| `POST /api/stripe/subscription_checkout` | Host plan upgrade |
| `POST /api/stripe/webhook` | Payment + subscription events |

Garage routes create PaymentIntents with metadata today. Persist orders in Supabase when migrations exist (TODO comments in route files).

---

## 3. Subscriptions

**UI:** Profile → Your plan (`SubscriptionPlansScreen`)

**Flow:**

1. Free plan → saved locally / profile field when synced
2. Starter / Pro → `POST /api/stripe/subscription_checkout` → redirect to Stripe Checkout
3. On success → webhook updates `profiles.subscription_plan_id` (implement in webhook)

Create Products in Stripe Dashboard, copy Price IDs to `STRIPE_PRICE_*`.

---

## 4. Stripe Connect (host payouts)

**UI:** Profile → Connect bank account

**Flow:**

1. `POST /api/stripe/connect_account_link` creates Express account if missing
2. Returns Stripe onboarding URL
3. On return, refresh profile — `stripe_connect_account_id`, `stripe_payouts_enabled`, `stripe_bank_last4`

Extend webhook for `account.updated` to sync payout status to `profiles`.

---

## 5. Push notifications

| Variable | Purpose |
|----------|---------|
| `VITE_VAPID_PUBLIC_KEY` | Client subscribe |
| `VAPID_PRIVATE_KEY` | `api/push/send.ts` |
| `VAPID_SUBJECT` | mailto: contact for push service |

After `garage_follows` table: trigger on new listing → call push API for followers with pref enabled.

---

## 6. In-app integration checklist

**More → Integrations** or **Profile → Integration status** shows live status from client-detectable env vars.

---

## 7. Deploy checklist

1. Merge PR with integration layer to `main`
2. Set all env vars on Vercel (see `.env.example`)
3. Run Supabase migrations (garage + follows)
4. Configure Stripe webhook endpoint → `https://app.allbyrent.com/api/stripe/webhook`
5. Test on device:
   - Garage cart checkout (signed-in user + Stripe test card)
   - Auction winner pay
   - Connect onboarding (test mode)
   - Plan upgrade → Checkout → webhook → profile plan

---

## 8. Demo / pilot without backend

The app remains fully usable in localStorage demo mode for friends-and-family pilots. No keys required until you want real payments or sync.
