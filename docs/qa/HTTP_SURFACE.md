# HTTP surface inventory

Stage 12 reference for the ~57 Vercel `/api/*` handlers under `api/` → `server/routes/`.
Auth column is what the **server** enforces today (not the UI gate).

| Route | Auth / gate |
| --- | --- |
| `GET /api/link` | Public (share / OG HTML) |
| `GET /api/og/image` | Public; remote `photo=` only Supabase storage/CDN hosts |
| `POST /api/feedback` | Public create; ops list/update needs `x-ops-key` = `OPS_PASSWORD` |
| `GET\|POST /api/ops/user-lookup` | `x-ops-key` = `OPS_PASSWORD` |
| `GET\|PATCH /api/ops/reports` | `x-ops-key` = `OPS_PASSWORD` |
| `POST /api/open-sale/ban` | Bearer (host of event) |
| `POST /api/proxy/llm` | Bearer required; `max_tokens` clamped; models allowlisted; rate-limited |
| `POST /api/proxy/photoroom` | Bearer + rate limit |
| `POST /api/auth/otp` | Public + rate limit |
| `POST /api/auth/phone_otp_send` | Bearer |
| `POST /api/auth/phone_otp_verify` | Bearer |
| `POST /api/auth/delete_account` | Bearer |
| `POST /api/auth/passkey-register-options` | Bearer |
| `POST /api/auth/passkey-register-verify` | Bearer |
| `POST /api/auth/passkey-auth-options` | Public; uniform 200 (no email enumeration) |
| `POST /api/auth/passkey-auth-verify` | Public (WebAuthn ceremony) |
| `POST /api/cohosts/invite-email` | Bearer + owned pending `inviteId` |
| `GET /api/geocode/us` | Rate-limited (anon/authed) |
| `GET /api/geocode/usps` | Rate-limited |
| `GET /api/vin/decode` | Public (NHTSA proxy) |
| `GET\|POST /api/vin/plate` | Public (optional PlateToVIN key) |
| `GET /api/push/vapid-public` | Public |
| `POST /api/push/send` | Bearer |
| `POST /api/listings/verify-qr` | Bearer (owner) |
| `POST /api/rentals/confirm-handoff` | Bearer (participant + PIN) |
| `POST /api/rentals/extend` | Bearer |
| `POST /api/rentals/invoice` | Bearer (host) |
| `GET /api/safely/quote` | Public quote helper |
| `POST /api/stripe/payment_intent` | Bearer (renter); amount = max(booked, listing×dates+fee floor) |
| `POST /api/stripe/rental_invoice` | Bearer; amount from open invoice row |
| `POST /api/stripe/auction_checkout` | Bearer; amount from lot `awaiting_checkout` |
| `POST /api/stripe/garage_checkout` | Bearer |
| `POST /api/stripe/boost` | Bearer; fixed tiers |
| `POST /api/stripe/deposit_intent` | Bearer |
| `POST /api/stripe/deposit_claim` | Bearer (host) |
| `POST /api/stripe/deposit_release` | Bearer (host) |
| `POST /api/stripe/payment_confirm` | Bearer |
| `POST /api/stripe/payment_capture` | Bearer (host) |
| `POST /api/stripe/payment_cancel` | Bearer |
| `POST /api/stripe/payment_refund` | Bearer (host for captured) |
| `POST /api/stripe/identity_session` | Bearer |
| `POST /api/stripe/connect_account_link` | Bearer |
| `POST /api/stripe/connect_account_session` | Bearer |
| `POST /api/stripe/connect_sync` | Bearer |
| `GET /api/stripe/connect_diag` | `CRON_SECRET` bearer |
| `POST /api/stripe/webhook` | Stripe signature; idempotent on `event.id` |
| `GET /api/cron/rental-no-show` | `CRON_SECRET` |
| `GET /api/cron/rental-overdue` | `CRON_SECRET` |
| `GET /api/cron/rental-pending-expiry` | `CRON_SECRET` |
| `GET /api/cron/abandoned-listing-nudge` | `CRON_SECRET` |
| `GET /api/cron/garage-sale-close` | `CRON_SECRET` |
| `POST /api/agent/{activity,finance,growth,listings,marketing,market,pricing,safety}` | `410` unless `AGENT_SCAFFOLD_ENABLED`; then `x-agent-key` = server `AGENT_API_KEY` only |
| `POST /api/orchestrator/run` | Same scaffold gate + agent key |

**Edge (Supabase functions):** `rental-overdue`, `rental-no-show` — always require `Authorization: Bearer $CRON_SECRET` (401 if unset).

**Shared guards:** CORS allowlist in `server/lib/cors.ts` (app / marketing / localhost / Capacitor). Proxy rate limits prefer Postgres `take_rate_limit_token` (migration `062`), fall back to in-memory per isolate.
