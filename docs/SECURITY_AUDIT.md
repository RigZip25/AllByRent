# Security audit — Evorios PWA

**Date:** 2026-07-13  
**Scope:** Frontend (Vite/React), Vercel serverless (`api/`, `server/`), Supabase RLS + Storage.

This is a pragmatic review for the current pilot — not a formal penetration test.

---

## Fixed in PR (prod-hardening)

| Issue | Severity | Fix |
|-------|----------|-----|
| `POST /api/push/send` — any logged-in user could push to arbitrary `toUserId` | **High** | Requires `notificationId`; verifies actor/recipient match or active rental relationship (`owner_id` / `renter_id`) |
| Listing full photo upload skipped when `storagePath` already set → 0-byte objects in Storage | **Medium** | Re-upload when local blob exists; refuse empty blobs |
| Remote photos showed "?" when full-size file corrupt but thumb OK | **Medium** | `useMediaUrl` prefers `thumbStoragePath` before full path |
| Removed listing photos left orphan files in `listing-photos` bucket | **Low** | `deleteListingPhotosFromRemote` on publish/edit save |
| Onboarding screens `WhatDoYouWant` / `YouAreAllSet` never reached | **Low (UX)** | Wired into resume + location completion flow |

---

## Acceptable for pilot (documented risks)

| Area | Risk | Mitigation / notes |
|------|------|-------------------|
| **Public `listing-photos` bucket** | Anyone with URL can view photos | Intentional for browse/OG; paths are unguessable UUID paths. Do not store sensitive documents here. |
| **Public `listing-verification` bucket** | QR proof photos are world-readable if URL leaks | Same as above; only upload non-sensitive proof shots. Migration `027` adds bucket + owner-only write. |
| **Client-side auth (Supabase JWT)** | Stolen token → account access until expiry | Standard SPA model; use short sessions, HTTPS only, Supabase dashboard anomaly alerts. |
| **localStorage demo data** | No encryption at rest on device | Expected for PWA; sensitive PII should live in Supabase with RLS when synced. |
| **Co-host invites** | No email verification of invite link | Copy-link UX; invitee must sign in with invited email and accept in-app. |
| **Stripe webhook** | Misconfigured secret → missed events | `STRIPE_WEBHOOK_SECRET` required; monitor Stripe dashboard. |
| **Cron endpoints** | Abuse if `CRON_SECRET` leaks | Keep secret in Vercel only; rotate if exposed. |
| **LLM API keys** | Server-side only on Vercel | Never prefix with `VITE_`; Gemini/Anthropic keys are not in client bundle. |

---

## Should change before wide public launch

| Priority | Item | Recommendation |
|----------|----------|----------------|
| **P1** | Push fan-out | Move web-push to Supabase trigger or queue; remove client-initiated `/api/push/send` except internal service role |
| **P1** | Rate limiting | Add Vercel edge rate limits on `/api/push`, `/api/auth`, `/api/stripe` |
| **P2** | Storage object validation | Server-side image size/type check on upload (Edge Function) — client can bypass MIME today |
| **P2** | Co-host invite tokens | Signed deep links (`?cohostToken=`) instead of email-only matching |
| **P2** | RLS audit | Re-run Supabase linter after each migration; fix any `USING (true)` policies outside public read buckets |
| **P3** | CSP headers | Tighten `Content-Security-Policy` on `app.evorios.com` |
| **P3** | Dependency scan | Enable GitHub Dependabot / `npm audit` in CI |

---

## What is in good shape

- Supabase RLS on `rentals`, `listings`, `co_hosts`, `notifications` — row-level ownership checks
- Stripe routes use webhook signature verification
- Push endpoint requires authentication (no anonymous spam)
- `CRON_SECRET` gating on scheduled jobs
- Service role (`SUPABASE_SERVICE_ROLE_KEY`) only on server, not in `VITE_*` vars

---

## Operator checklist (you)

1. Run migration **027** in Supabase SQL editor (or `supabase db push`) for `listing-verification` bucket
2. Re-publish test listing `6fcf2acb-bc68-40b3-a8d8-30d7023a940e` to fix 0-byte full image
3. Confirm Vercel env: `VAPID_*`, `CRON_SECRET`, `STRIPE_WEBHOOK_SECRET`, no `VITE_` on secrets
4. Review Supabase → Storage → Policies warnings after deploy
