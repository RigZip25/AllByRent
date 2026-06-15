# Garage Showcase — product direction & task map

**Brand:** [Evorios](EVORIOS.md) · **Metaphor:** every household runs a **Garage Showcase** (витрина гаража) on the block.

**Last updated:** 2026-06-15

---

## One sentence

> **Evorios turns every home into a neighborhood garage showcase** — borrow, buy, rent-to-own, or pass along items without leaving your block.

---

## What stays (foundation)

| Area | Why it stays |
|------|----------------|
| Listing wizard (7 steps) | Already = putting items on your showcase |
| Modes: borrow / sell / RTO / gift | Core commerce; only **labels** change in UI |
| Supabase + localStorage | Data model is listing-centric, not “rental-only” |
| Auth, passkeys, OAuth | Infrastructure |
| QR, verification photo, stickers | Physical garage → digital handoff |
| Chat, notifications, disputes, reviews | Trust on the block |
| Stripe branch (PR #16) | Payments when merged |
| Categories & taxonomy | Same shelves, different story |

---

## What changes (rebrand & narrative)

| Area | Change |
|------|--------|
| **AllByRent → Evorios** | Name, manifest, PWA, splash, meta |
| **Rentano → Evorios** | One mascot name; same character art for now |
| **Earn / Rent toggle** | **My Garage** / **Browse** |
| **Host Dashboard** | **My Garage** — your showcase stats |
| **Taglines** | “Social Rental Network” → evolution / garage showcase |
| **Onboarding copy** | Neighbor garage, not “rental network” |
| **FAQ, share captions, PDFs** | Evorios + evorios.com |
| **docs/EVORIOS.md** | Evolution log |

---

## What changes deeply (phased product)

| Phase | Work | Priority |
|-------|------|----------|
| **P1** | String rebrand + `brand.ts` single source | **Now** (`cursor/evorios-rebrand-ca09`) |
| **P2** | Home feed = **neighborhood garages** (cards feel like driveways, host identity) | High |
| **P3** | Listing detail = **shelf on a garage** (modes as badges: Borrow · Buy · …) | High |
| **P4** | **Sell checkout** as first-class (not only booking flow) | High |
| **P5** | Rename nav **Rentals → Bookings** (or **Activity**); optional DB rename `rentals` → `orders` later | Medium |
| **P6** | **evorios.com** landing (3 evolution pillars) | Medium |
| **P7** | Merge Stripe PR #16, env, migrations 021–022 | High (money) |
| **P8** | New mascot art / splash wordmark (Evo**rios**) | Low (design) |
| **P9** | Tasks 28–32, 34–35 per backlog in EVORIOS.md | Later |

---

## UI language (English, US)

| Legacy | Evorios |
|--------|---------|
| AllByRent | Evorios |
| Mr. Rentano / Rentano | Evorios |
| Social Rental Network | Garage Showcase · evolve how your home shares |
| Earn | **My Garage** |
| Rent (mode) | **Browse** |
| Host Dashboard | **My Garage** (or **Garage overview**) |
| List item | **Add to showcase** / **Stock your garage** (pick one in P2) |

Internal code keys (`earn`, `rent`, `rentals` table) can stay until a dedicated migration.

---

## Task checklist (rebrand branch)

- [x] `src/lib/brand.ts` — constants
- [x] `src/lib/evoriosPrompt.ts` — mascot voice
- [ ] Splash + onboarding strings
- [ ] Home mode labels (My Garage / Browse)
- [ ] manifest, index.html, vite PWA manifest
- [ ] FAQ, AuthGate, share cards, QR PDF footer
- [ ] File/component renames (`Rentano*` → `Evorios*`) — optional pass 2
- [ ] `package.json` name `evorios`

---

## Evolution log

| Date | Note |
|------|------|
| 2026-06-15 | Garage Showcase direction + P1 rebrand started on `cursor/evorios-rebrand-ca09` |
