# Evorios — Launch Readiness Report

**Date:** 2026-06-18  
**Production:** https://app.evorios.com  
**Marketing:** https://evorios.com
**Repo branch:** `main` (after PR #30 nav fix + launch share/push work)

This document is the single launch checklist. Use it when preparing a public launch (e.g. Arkansas 71909 pilot).

---

## Executive summary

| Area | Status | Launch tomorrow? |
|------|--------|------------------|
| Core PWA (browse, list, book demo) | ✅ Works | Yes — demo/localStorage path |
| Bottom navigation | ✅ Fixed (PR #30) | Yes |
| Social share (listing + garage + request) | ✅ Improved this sprint | Yes — with manual paste for TikTok/IG |
| Mr. Evorios (FAQ + chat) | ✅ Works | Yes — needs `ANTHROPIC_API_KEY` for AI |
| Push notifications | 🟡 Partial | Soft launch only — needs VAPID + server fan-out |
| Payments / deposits (Stripe) | 🟡 Demo + API stubs | Needs your Stripe keys |
| Auth (magic link, passkey) | 🟡 Works with Supabase | Needs your Supabase project |
| Agent orchestrator (growth bots) | 🔴 Scaffolding | Post-launch |

**Verdict:** Safe for a **guided pilot** in demo/local mode and for **early hosts** who accept “share manually to TikTok/Instagram.” Not yet a fully autonomous growth machine — that requires your backend keys and a short server sprint.

---

## What was fixed recently

### Navigation freeze (PR #30 — shipped)
- **Root cause:** infinite loop `loadUserProfile → countOwnListings → resolveHostAccountId → loadUserProfile`.
- **Fix:** `hostIdentity.ts` reads profile id/email from localStorage directly.
- **Also:** single bottom nav in `App.tsx`, deferred HostDashboard loads, PWA auto-reload removed.

### This sprint (share, push prefs, agent nudges)
- **`src/lib/socialShare.ts`** — platform-aware share (Facebook, WhatsApp, Nextdoor, X URLs; TikTok/IG copy + open upload).
- **`SocialShareButtons`** — reused on listing share, item detail, garage, post-request.
- **Garage share** — header button on My Garage + proactive Mr.E card when not shared recently.
- **Follow garage** — on neighbor garage screen; local follow list + in-app notify on new listing.
- **Notification preferences** — granular toggles in Notifications screen.
- **Push SW handlers** — `public/push-sw.js` imported by Workbox (show notification + click → open app).
- **`docs/LAUNCH_READINESS.md`** — this file.

---

## What works today (no action needed)

1. **Onboarding** — splash, role choice, location (71909 / trip), home feed.
2. **Browse** — categories, subcategory shelves, item detail, favorites.
3. **Listing wizard** — photos, AI suggest (if Anthropic configured), QR flow, publish.
4. **Post-publish share** — AI caption + PNG cards (story / square / landscape) + per-platform buttons.
5. **Garage tab** — listings, booking requests, earnings stats (local).
6. **Mr. Evorios** — FAQ-first chat, install PWA tab.
7. **Rentals** — local demo bookings, QR scan panel.
8. **Reset** — `?resetApp=1` clears app storage including auth pending keys.
9. **Deep links** — `?listingId=`, `?screen=home|mre|garage|more`, `?skipSplash=1`.

---

## Blocked on YOUR actions

| Blocker | What you provide | What unlocks |
|---------|------------------|--------------|
| **Supabase** | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, run migrations | Real auth, listings sync, messages, notifications table |
| **VAPID keys** | `VITE_VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` on Vercel | Background push when app closed |
| **Anthropic** | `ANTHROPIC_API_KEY` on Vercel | AI captions, Mr.E chat beyond FAQ |
| **Stripe** | `STRIPE_SECRET_KEY`, webhook secret, `VITE_STRIPE_PUBLISHABLE_KEY` | Deposits, boosts, payouts |
| **Domain email** | SendGrid/Resend for magic links | Reliable auth email (optional if using Supabase built-in) |
| **Apple/Google developer** | Only if native apps later | Not required for PWA launch |

Until Supabase is live, the app runs in **localStorage demo mode** — fine for friends-and-family in Hot Springs Village / 71909.

---

## Social sharing — current vs ideal

### Implemented
| Surface | Formats | Platforms |
|---------|---------|-----------|
| Post-listing share screen | Story 9:16, Square 1:1, Card 1200×628 | TikTok, IG, FB, Nextdoor, WhatsApp, native share |
| Item detail | Text + link | Same buttons |
| My Garage | Garage URL + caption | Same buttons |
| Post request | Request text | Same buttons |
| Subcategory empty shelf | Text + marketing URL | Native share / clipboard |

### Platform reality (all apps)
- **Facebook / WhatsApp / Nextdoor / X:** opens web share URL with caption + link.
- **TikTok / Instagram:** no reliable public “post image via URL” API — app **copies caption**, attempts clipboard image, opens upload page. User pastes — industry standard for PWAs.
- **Nextdoor:** Sharekit URL — best for neighbor apps.

### Recommended next (post-launch, ~1 server sprint)
1. **Open Graph meta** on `index.html` or SSR for `?listingId=` previews in iMessage/Facebook.
2. **Scheduled share reminders** — agent cron: “Day 3: repost to Nextdoor.”
3. **Unique short links** — `evor.io/g/{hostId}` for analytics.
4. **Video export** — 15s slideshow MP4 for TikTok (Remotion or ffmpeg on API).

---

## Push notifications — current vs ideal

### Implemented
- Client: subscribe + save to `profiles.push_subscriptions`
- Server: `api/push/send` (web-push) — **requires `notificationId` + rental/notification relationship** (see `docs/SECURITY_AUDIT.md`)
- SW: `push` + `notificationclick` handlers
- UI: Enable push + **preference toggles** (bookings, messages, new garages, open house, listing updates, Mr.E tips)
- **Follow garage** stores intent locally; **in-app** notify on new listing (demo fan-out)

### Not yet implemented (needs Supabase)
- `garage_follows` table + RLS
- Trigger on `listings` insert → `api/push/send` for followers where `notify_new_listings`
- `open_house_events` table + host UI to schedule “open garage day”
- Respect `notificationPreferences` on server before send
- Unsubscribe / revoke push endpoint UI

---

## Agent / proactive growth — brainstorm

Vision: **native-feeling agents** that nudge hosts and renters at the right moment.

### Live today (reactive + light proactive)
| Trigger | Agent behavior |
|---------|----------------|
| Listing wizard steps | `RentanoHint` bubbles per step |
| After publish | “Share while it’s fresh” card on share screen |
| Garage has listings, no recent share | “Share your garage” card |
| Mr.E chat | FAQ → local answer → Claude |
| Share action logged | `allbyrent_share_log` for future agent rules |

### Proposed agents (priority order)

1. **Share Agent** (P0 — aligns with launch)
   - T+0h after publish: “Post Story to Instagram”
   - T+24h: “Bump on Nextdoor”
   - T+7d: “Seasonal repost” if no bookings
   - Implementation: `api/agent/marketing.ts` + cron on Vercel

2. **Onboarding Agent** (P0)
   - “You listed — add QR sticker photo”
   - “Set your block address for 71909 search”
   - Uses `orchestrator_logs` + push/in-app

3. **Neighbor Agent** (P1)
   - Renter hasn’t booked in 7d → “New shelf on your block”
   - Uses feed diff + `newGaragesNearby` pref

4. **Open House Agent** (P1)
   - Host taps “Open garage Saturday 9–12” → push followers + share card template

5. **Pricing Agent** (P2)
   - `api/agent/pricing.ts` — suggest daily rate from category + ZIP

6. **Safety Agent** (P2)
   - Deposit reminder, identity nudge before first booking

### Sample proactive copy (English)
- “Posted! Next step: share to Nextdoor — neighbors within 5 mi see it first.”
- “I can help: want a shorter caption for TikTok?”
- “Open garage day? Tell followers — 12 people saved your shelf.”

---

## Launch tomorrow — runbook

### You (15 min)
1. Open https://app.evorios.com/?resetApp=1 on phone (install PWA).
2. Complete onboarding with **71909** / your block.
3. Publish one test listing → share screen → try **Nextdoor** + **Copy caption**.
4. Tap **Garage → Share** and **More → Notifications → Enable push** (if prompted).
5. Optional: add Vercel env vars from table above.

### Smoke test URLs
```
?skipSplash=1&screen=home
?skipSplash=1&screen=more
?skipSplash=1&screen=garage
?skipSplash=1&screen=mre
?listingId=<id>
?resetApp=1
```

### Commands
```bash
npm run build
npm run lint
npm run dev   # http://localhost:5173
```

---

## Known gaps / polish

| Item | Severity |
|------|----------|
| `profile.notificationsEnabled` in Profile still display-only — use Notifications prefs | Low |
| PostRequest TikTok row was stub — now wired | Fixed |
| Item detail Share was dead — now wired | Fixed |
| Agent APIs return empty scaffolding | Expected |
| Bundle size >1.4MB — code split later | Low |
| Some lint warnings pre-existing | Low |
| OG tags for link previews | Medium for social |
| `garage` query param boot on home (deep link to neighbor garage) | Medium |

---

## File map (new/changed this sprint)

| Path | Purpose |
|------|---------|
| `src/lib/socialShare.ts` | Platform share helpers |
| `src/components/share/SocialShareButtons.tsx` | UI button grid |
| `src/lib/notificationPreferences.ts` | Push/in-app prefs |
| `src/lib/garageFollowStorage.ts` | Follow garages locally |
| `src/lib/garageFollowNotify.ts` | Demo fan-out on publish |
| `src/components/agent/ProactiveAgentCard.tsx` | Mr.E nudge card |
| `src/components/notifications/NotificationPreferencesPanel.tsx` | Settings UI |
| `public/push-sw.js` | SW push + click |
| `src/lib/hostIdentity.ts` | Nav freeze fix |

---

## Suggested roadmap (after pilot)

**Week 1:** Supabase + VAPID live; follower table; OG link previews.  
**Week 2:** Share Agent cron; open garage day UI.  
**Week 3:** Stripe deposits in production; host payout onboarding.  
**Week 4:** TikTok video export; Nextdoor API if partnership available.

---

*Generated by cloud agent session — update this file when blockers are cleared.*
