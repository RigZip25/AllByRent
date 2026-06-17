# Evorios Home — redesign spec (agreed)

**Version:** 1.0 · **2026-06-17  
**Status:** P0 in progress  
**Sources:** Cursor + Claude consensus · [EVORIOS_CURSOR_BRIEF.md](EVORIOS_CURSOR_BRIEF.md)

---

## Principle

**Home = window on the neighborhood block.** No role fork at entry. Intent is chosen by tap, not questionnaire.

| Old | New |
|-----|-----|
| Earn / Rent toggle on home | Home is always discovery |
| Category grid as default | Unified **Feed** as default |
| «What brings you here?» | Removed — soft supply nudge only |
| Traveler = separate onboarding branch | **Cluster** (~50 mi) in location chip |
| Favorites tab | Dropped Stage 1 |
| Mr. Evorios center nav | **＋ Stock item** center; Mr. Evorios contextual |

---

## Layout (top → bottom)

```
Evorios™                              🔔  📋
📍 Austin, TX · within 12 mi                    ›

┌─────────────────────────────────────────────┐
│  🔍  What do you need?                      │  ← search-hero
│      tile saw near me this weekend          │
└─────────────────────────────────────────────┘

  [ All ]  [ Rent ]  [ Buy ]  [ Gift ]         ← mode chips (not gates)

  [ Feed ]    [ Garages ]    [ Map — later ]   ← lenses; Feed default

  … unified item feed or garage cards …

  Mr. Evorios inline banner when cluster sparse
```

### Map lens

**Deferred past P1.** Teaser only when implemented: «Opens when N garages on the block». Not built on cold start — focus is first 10–25 rentals in one cluster.

---

## Two-level cards

### Feed lens — item + garage context

Scan line: **what / how much**  
Trust line (co-equal, never footnote gray): **`Mike's Garage · ⭐ 4.9 · 0.8 mi`**

P2P conversion = trust + proximity, not price alone.

### Garages lens — whole storefront

```
Kim's Garage · 1.1 mi · 7 on shelf
Tools · Outdoor · Kids
[ Peek inside → ]
```

Tap → garage shelf grid → item detail.

---

## Bottom navigation (Stage 1)

| Tab | Action |
|-----|--------|
| **Home** | Feed + Garages lenses |
| **Search** | Same discovery UI, search focused |
| **＋** (center) | Start listing (`listingIntro`) — supply priority |
| **Garage** | **My Garage** — own storefront, stats, bookings, settings entry |
| **Mr. Evorios** | Chat / FAQ (not elevated center) |

**Removed Stage 1:** ♡ Favorites, Profile tab, My Garage/Browse toggle on home.

**Bookings (renter):** header icon on home (not bottom tab). Host bookings live in **Garage** tab.

**Settings:** gear inside Garage tab → Profile screen.

---

## Sparse → dense evolution

| Stage | Cluster | Home behavior |
|-------|---------|---------------|
| **0** | &lt;10 listings | Feed-first; inline Mr. Evorios; empty search → **post a request**; no category mega-grid |
| **1** | 10–50 | Horizontal **department shelves** emerge per category |
| **2** | 50+ | Map lens enabled; optional «Saturday mode» marketing |

No fake metrics («120+ garages», «4 on your block» interstitial).

---

## Onboarding

1. Splash → First Hello  
2. **Where's your block?** (cluster / location)  
3. **Straight to Feed + search** — no `WhatDoYouWant`, no `You're all set` stats interstitial  

**Soft supply nudge:** optional «Stock my garage» on home banner or after first session — skippable, not a gate.

---

## Implementation phases

| Phase | Scope |
|-------|--------|
| **P0** ✅ target | Mode toggle gone; hero search; Feed + Garages lenses; trust-line cards; empty → post request; nav ＋ center; Garage tab; onboarding without role fork |
| **P1** | Garage shelf view; department shelves at N; ranking |
| **P2** | Map lens; semantic search in hero |
| **P3** | pgvector; per-cluster department graduation in API |

---

## Decisions log

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Garage = 5th tab, not inside Profile | Brand = garage; supply surface must stay visible |
| 2 | Map not in P1 | Zero value &lt;20 items; engineering cost |
| 3 | No interstitial after onboarding | Feed + search immediately |
| 4 | Trust line co-equal on cards | Fat Llama lesson — P2P converts on who + distance |
| 5 | No role fork; soft stock nudge OK | Same disease as «What brings you here» |
| 6 | Center nav = ＋, not Mr. Evorios | Stage 1 priority = supply |
| 7 | Chips Rent · Buy · Gift only | Gift = free; no duplicate chip |
