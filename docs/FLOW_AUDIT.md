# Evorios — flow audit (screen by screen)

**How to use:** Walk the app on your Mac in order. For each row: open the screen, compare copy/UX to **Garage Showcase**, tick when done.

**Screen overhaul (keep/redo/assets):** [SCREEN_OVERHAUL.md](SCREEN_OVERHAUL.md) · **App concept:** [APP_CONCEPT.md](APP_CONCEPT.md)

**Brand rules:** [EVORIOS.md](EVORIOS.md) · **Task phases:** [GARAGE_SHOWCASE.md](GARAGE_SHOWCASE.md)

**Legend**

| Tag | Meaning |
|-----|---------|
| ✅ P1 | Done in PR #18 (`cursor/evorios-rebrand-ca09`) |
| 🟡 Copy | Change strings only (use `src/lib/brand.ts`) |
| 🟠 UX | Wording + layout/metaphor (garage, showcase, porch) |
| 🔴 Product | New behavior (sell checkout, feed cards, etc.) |
| ⚪ Keep | No change needed for rebrand |

**Effort:** S = small (&lt;30 min) · M = medium · L = large

---

## A. Cold start & onboarding

| # | Screen | How to open | Status | Files | What to do |
|---|--------|-------------|--------|-------|------------|
| A1 | Splash (dynamic) | Fresh session | 🟢 DONE | `SplashScreen.tsx` | `?screen=splash&dynamic=1` preview |
| A2 | First hello | After splash | 🟢 copy | `FirstHello.tsx` | New art: `evorios_garage_roles.png` |
| A3 | What brings you here | Onboarding | 🟢 DONE | `WhatDoYouWant.tsx` | Wired after FirstHello when role not chosen |
| A4 | Where's your block | Browse path | 🟢 DONE | `WhereAreYou*.tsx` | US trip examples |
| A5 | You're all set | End onboarding | 🟢 DONE | `YouAreAllSet.tsx` | Shown after location setup before Browse Hub |
| A6 | Auth gate | Book/list w/o login | 🟢 DONE | `AuthGate.tsx` | Mr. Evorios tips |
| A7 | Passkey setup | After first login | ⚪ | `PasskeySetup.tsx` | Optional Evorios one-liner |

**Test:** clear site data → reload `http://localhost:5173/` — or open `http://localhost:5173/?screen=splash` (garage splash is on branch `cursor/evorios-rebrand-ca09`, not `main` yet)

---

## B. Home & discovery (Browse mode)

| # | Screen | How to open | Status | Files | What to do |
|---|--------|-------------|--------|-------|------------|
| B1 | Home header + mode toggle | `?screen` default home | ✅ P1 | `HomeFeed.tsx` | — |
| B2 | Empty search hint | Search nonsense on home | 🟡 S | `HomeFeed.tsx` | "Rentano:" → **Evorios:** |
| B3 | Category grid | Home scroll | ⚪ | `HomeFeed.tsx` | Categories OK; later 🟠 "shelves on the block" |
| B4 | Subcategory shelf | Tap category | 🟠 M | `Subcategory.tsx` | Share text still **AllByRent**; empty shelf copy → garage/neighbor |
| B5 | Post request (wanted item) | Empty shelf CTA | 🟡 S | `PostRequest.tsx` | Evorios + garage wording |
| B6 | Item detail | Tap listing card | 🟠 M | `ItemDetail.tsx` | Mode badges: Borrow/Buy vs rent/sell; host = "garage" not "host" optional |
| B7 | Favorites | Nav (Browse mode) | 🟡 S | `FavoritesScreen.tsx` | AllByRent strings |
| B8 | Notifications | Bell on home | 🟡 S | `NotificationsScreen.tsx` | Rentano tips if any |
| B9 | Location picker | Tap location on home | ⚪ | `AddressLocationPicker` | OK |

**Test:** `http://localhost:5173/` → toggle **Browse**

---

## C. Home & host (My Garage mode)

| # | Screen | How to open | Status | Files | What to do |
|---|--------|-------------|--------|-------|------------|
| C1 | My Garage dashboard | Toggle **My Garage** | ✅ P1 title | `HostDashboard.tsx` | — |
| C2 | Stats / pending requests | My Garage | 🟠 M | `HostDashboard.tsx` | "Earnings" → **Showcase activity**?; request cards copy |
| C3 | List item (+) | Green + button | 🟡 S | `ListingIntro.tsx` | Intro → "Add to your showcase" |
| C4 | Business / insights | Nav 4th tab (earn) | 🟠 M | `EarnBusinessScreen.tsx` | Title, growth tips — garage showcase language |
| C5 | Subscription plans | Profile → plans | 🟡 S | `SubscriptionPlansScreen.tsx` | Evorios plan names context |

**Test:** toggle **My Garage**

---

## D. Listing wizard (7 steps) — host flow

Open: My Garage → **+** → wizard. URL: `?step=0` … `?step=6` (when wired).

| Step | Name | Status | Files | What to do |
|------|------|--------|-------|------------|
| D1 | Photos | 🟡 S | `Step1Photos.tsx` | Rentano hints → Evorios; "Step 2" copy |
| D2 | Item info | 🟡 S | `Step2ItemInfo.tsx` | "Ask Rentano to improve" → **Ask Evorios** |
| D3 | Modes & pricing | 🟠 M | `Step3Modes.tsx` | Mode titles: **Borrow** / **Buy** / RTO / **Pass along** (optional); "Earn daily" → showcase pricing |
| D4 | Pickup & delivery | 🟡 S | `Step4PickupDelivery.tsx` | Porch/yard language; RentanoHint |
| D5 | Availability | 🟡 S | `Step5Availability.tsx` | "Pause listing" → **Pause showcase** |
| D6 | QR | 🟡 S | `Step6QR.tsx` | Garage sticker narrative |
| D7 | Review & publish | 🟡 S | `Step7Review.tsx` | "Go live" → **Open on your showcase** |
| — | Wizard shell | 🟡 S | `ListingWizard.tsx` | "Rentano is analyzing" → Evorios |
| — | AI improve | 🟡 S | `listingDescriptionImprove.ts` | System prompt Mr. Rentano → Evorios |

---

## E. After publish (listing satellite screens)

| # | Screen | Status | Files | What to do |
|---|--------|--------|-------|------------|
| E1 | Publish success | 🟡 S | `ListingPublishSuccess.tsx` | Brand mark ✅ via AppBrandMark |
| E2 | QR story (3 slides) | 🟡 M | `QRStoryScreen.tsx` | Rentano → Evorios; PDF filenames |
| E3 | QR sticker / PDF | 🟡 M | `QRStickerScreen.tsx`, `generateQRSticker.ts` | ✅ footer Evorios; 🟡 many `AllByRent-*.pdf` names |
| E4 | Verification photo | 🟡 S | `verification flow` | "Go live" / garage |
| E5 | Share listing | 🟡 M | `ListingShareScreen.tsx`, `shareCards.ts` | ✅ badge Evorios; 🟡 caption templates |
| E6 | Boost | 🟡 S | boost UI | Evorios; Stripe still stub |
| E7 | Host listing detail | 🟡 S | `HostListingDetailScreen.tsx` | — |

---

## F. Booking & active rental (Browse → transaction)

| # | Screen | How to open | Status | Files | What to do |
|---|--------|-------------|--------|-------|------------|
| F1 | Booking request | Item detail → book | ⚪ / 🔴 | `BookingScreen.tsx` | Flow OK for **borrow**; 🔴 later: **Buy** path for sell mode |
| F2 | Booking confirmed | After confirm | 🟡 S | `BookingConfirmedScreen.tsx` | Copy |
| F3 | Rentals list | Nav **Rentals** | 🟠 M | `RentalsScreen.tsx` | Tab name → **Bookings**?; AllByRent strings |
| F4 | Rental card | Rentals tab | 🟡 S | `RentalCard.tsx` | Rentano chip; deposit actions OK |
| F5 | Active rental | Active booking | 🟡 S | `ActiveRental.tsx` | Rentano tips |
| F6 | QR scan / PIN | Active rental | 🟡 S | `QrScanPanel.tsx` | "inside AllByRent app" |
| F7 | Disputes | Active / overdue | ⚪ | `disputesStorage` UI | Minor copy |

**Test:** `?screen=login` → book demo listing

---

## G. Profile & settings

| # | Screen | Status | Files | What to do |
|---|--------|--------|-------|------------|
| G1 | Profile | 🟠 M | `ProfileScreen.tsx` | Rent/Earn toggle labels; Rentano menu; agent link |
| G2 | Identity verification | 🟡 S | `IdentityVerificationScreen.tsx` | Rentano → Evorios |
| G3 | Co-hosts | 🟡 S | `CoHostsScreen.tsx` | Garage co-manager narrative |
| G4 | Delete account | ⚪ | `DeleteAccount.tsx` | Legal entity name |
| G5 | Agent activity | ⚪ | `AgentActivityScreen.tsx` | Internal/dev |

**Test:** `?screen=profile`

---

## H. Evorios companion (center nav)

| # | Surface | Status | Files | What to do |
|---|---------|--------|-------|------------|
| H1 | Bottom nav label | ✅ P1 | `BottomNav.tsx` | — |
| H2 | Chat sheet menu | 🟡 M | `RentanoChat.tsx`, panels | Titles "Rentano" → **Evorios**; file renames later |
| H3 | FAQ | 🟡 M | `rentanoFaq.ts` | ✅ top entries; 🟡 rest still Rentano/Earn/Rent |
| H4 | Hints in wizard | 🟡 M | `RentanoHint.tsx` | Display name only or rename component |
| H5 | System prompt | ✅ P1 | `evoriosPrompt.ts` | — |
| H6 | PWA install tips | 🟡 S | `PwaInstall*.tsx` | AllByRent → Evorios |

---

## I. Infrastructure (not visible but do before evorios.com)

| Item | Status | Files |
|------|--------|-------|
| Package name | ✅ P1 | `package.json` |
| HTML / PWA manifest | ✅ P1 | `index.html`, `vite.config.ts`, `manifest.webmanifest` |
| Nominatim user-agent | 🟡 S | `nominatimApi.ts` → Evorios |
| Push / email from name | 🟡 S | `api/push/send.ts` |
| localStorage keys | ⚪ Keep | `allbyrent_*` — migrate later to avoid data loss |
| DB table `rentals` | ⚪ Keep | rename to `orders` only with migration |
| Stripe PR #16 | ⬜ Merge | payments branch |

---

## Recommended walk order (one sitting on Mac)

1. Clear storage → **A** onboarding  
2. **Browse** → **B** discovery → open item **F1**  
3. Switch **My Garage** → **C** → **D** wizard (steps 0–6)  
4. Skip publish or publish test → **E**  
5. Nav: Rentals **F**, Profile **G**, center **H**  
6. Tick rows in this doc; commit copy fixes in small PRs per section (A, B, D, …)

---

## Progress tracker

| Section | Copy done | UX done | Notes |
|---------|-----------|---------|-------|
| A Onboarding | ✅ | 🟡 | Need new PNGs per SCREEN_OVERHAUL |
| B Browse | 🟡 | — | P2 feed |
| C My Garage | 🟡 | — | Listing intro art |
| D Wizard | 🟡 | — | Mode labels P2 |
| E Post-publish | 🟡 | — | QR/share art |
| F Booking | 🟡 | — | Sell checkout P4 |
| G Profile | 🟡 | — | — |
| H Mr. Evorios | ✅ | 🟡 | Avatar art |
| I Infra | 🟡 | — | PWA icons |

*Update this table as you walk the flow.*

---

## Evolution log

| Date | Note |
|------|------|
| 2026-06-16 | **SCREEN_OVERHAUL.md** — full keep/redo/asset audit; onboarding A2–A5 rebrand in code |
| 2026-06-15 | Initial flow audit created — walk screen-by-screen before P2 feed redesign |
