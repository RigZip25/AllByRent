# Evorios — полный осмотр экранов и план перелопачивания

**Цель:** перестроить приложение под **Evorios / Garage Showcase / Mr. Evorios**, без потери рабочего backend.

**Связанные документы:** [APP_CONCEPT.md](APP_CONCEPT.md) · [FLOW_AUDIT.md](FLOW_AUDIT.md) · [GARAGE_SHOWCASE.md](GARAGE_SHOWCASE.md) · [EVORIOS.md](EVORIOS.md)

**Last updated:** 2026-06-16 (ночная итерация `cursor/evorios-overhaul-onboarding-ca09`)

---

## Легенда решений

| Метка | Значение |
|-------|----------|
| ✅ **KEEP** | Экран и флоу остаются; только мелкий копирайт |
| 🟢 **DONE** | Уже переделано в коде (эта ветка / main) |
| 🟡 **COPY** | Только тексты / картинки, логика та же |
| 🟠 **REDO UX** | Новый layout, метафора гаража, те же API |
| 🔴 **REDO PRODUCT** | Новое поведение (sell checkout, лента гаражей) |
| ⏸ **DEFER** | После US v1 / после evorios.com |
| 🗑 **CUT** | Убрать или спрятать в v2 |

---

## Что сделано в этой итерации (код)

| Область | Изменение |
|---------|-----------|
| **Onboarding A2–A5** | Stock my garage / Browse the block; Where's your block; Explore Evorios |
| **Ассеты онбординга** | `src/imports/onboarding/evorios_*.png` — плейсхолдеры (можно заменить файлы) |
| **brand.ts** | `ONBOARDING.*`, слоган evolution, `mascotSays()` |
| **Mr. Evorios** | FAQ, чат, hints, wizard, share, PWA, offline |
| **Splash** | Динамика по умолчанию; превью `?screen=splash` / `&dynamic=1` / `&art=1` |
| **Listing intro** | Копирайт «garage / showcase / block» |
| **Subcategory share** | Evorios + evorios.com |

---

## A. Cold start & onboarding

| # | Экран | Решение | Статус | Файлы | Комментарий |
|---|--------|---------|--------|-------|-------------|
| A1 | Splash (dynamic) | ✅ KEEP + 🟢 | DONE | `SplashScreen.tsx` | ~2.6s, Evorios + evolution tagline |
| A1b | Splash static preview | ✅ KEEP | DONE | `?screen=splash` | Для макета с картинкой |
| A1c | Splash art only | ✅ KEEP | DONE | `?screen=splash&art=1` | Только PNG гаража |
| A2 | First hello | 🟠 REDO UX | 🟢 copy + assets | `FirstHello.tsx` | Нужен **новый арт** ролей (см. § Assets) |
| A3 | What brings you here | 🟠 REDO UX | 🟢 copy + assets | `WhatDoYouWant.tsx` | Карточки Stock / Browse |
| A4 | Where's your block | 🟡 COPY | 🟢 | `WhereAreYou.tsx` | Trip path — ⏸ упростить для US-only позже |
| A4b | Trip destination | 🟡 COPY | 🟢 | `WhereAreYouHeading.tsx` | Примеры US cities |
| A4c | Manual address | ✅ KEEP | — | `WhereAreYouManual.tsx` | — |
| A5 | You're all set | 🟠 REDO UX | 🟢 | `YouAreAllSet.tsx` | Теги My Garage / Browse |
| A6 | Auth gate | 🟡 COPY | 🟢 | `AuthGate.tsx` | Mr. Evorios tips |
| A7 | Passkey setup | 🟡 COPY | — | `PasskeySetup.tsx` | Одна строка Evorios |

**Флоу хозяина:** Splash → Hello → **Stock garage** → (auth) → Listing intro → wizard.  
**Флоу соседа:** Splash → Hello → **Browse** → Where's block → Home Browse.

---

## B. Home & discovery (Browse)

| # | Экран | Решение | Статус | Комментарий |
|---|--------|---------|--------|-------------|
| B1 | Home + toggle | ✅ KEEP | 🟢 | My Garage / Browse |
| B2 | Category grid | 🟠 REDO UX | — | P2: полки квартала, не «каталог Amazon» |
| B3 | Search empty | ✅ KEEP | 🟢 | Mr. Evorios hint |
| B4 | Subcategory shelf | 🟠 REDO UX | 🟡 share | P2: карточки = полка в гараже соседа |
| B5 | Empty shelf | 🟠 REDO UX | — | Mr. Evorios + post request |
| B6 | Item detail | 🟠 REDO UX | — | Badges Borrow · Buy · RTO · Gift |
| B7 | Favorites | 🟡 COPY | — | «Saved from neighborhood garages» |
| B8 | Notifications | 🟡 COPY | — | — |
| B9 | Location picker | ✅ KEEP | — | — |

---

## C. My Garage (host)

| # | Экран | Решение | Статус | Комментарий |
|---|--------|---------|--------|-------------|
| C1 | Host dashboard | 🟠 REDO UX | title 🟢 | P2: «showcase stats», не generic earnings |
| C2 | List (+) intro | 🟠 REDO UX | 🟢 copy | 3 слайда garage; **новые иллюстрации** |
| C3 | Listing wizard 1–7 | ✅ KEEP flow | 🟡 hints | Логика 7 шагов = витрина; режимы переименовать в UI |
| C4 | Business / insights | 🟠 REDO UX | — | Garage growth, не «rental business» |
| C5 | Subscription plans | 🟡 COPY | — | Evorios plan names |

---

## D. Listing wizard (детально)

| Step | Решение | Картинки / UI |
|------|---------|----------------|
| 1 Photos | 🟡 COPY | Mr. Evorios analyze; optional hero на шаге |
| 2 Item info | 🟡 COPY | 🟢 Ask Mr. Evorios to improve |
| 3 Modes | 🟠 REDO UX | Borrow / Buy / RTO / Pass along labels |
| 4 Pickup | 🟡 COPY | Porch / contactless / yard |
| 5 Availability | 🟡 COPY | Pause **showcase** |
| 6 QR | 🟡 COPY | Garage sticker narrative |
| 7 Review | 🟡 COPY | «Open on your showcase» |

---

## E. After publish

| # | Экран | Решение | PDF/art |
|---|--------|---------|---------|
| E1 | Publish success | 🟡 COPY | Confetti OK |
| E2 | QR story (3 slides) | 🟠 REDO UX | 🟢 Mr. Evorios; **новые qr_story_* или единый стиль** |
| E3 | QR sticker PDF | 🟡 COPY | Filename `Evorios-QR-*.pdf` (ещё не везде) |
| E4 | Verification photo | 🟡 COPY | 🟢 |
| E5 | Share cards | 🟠 REDO UX | 🟡 caption; **новые share card templates** |
| E6 | Boost | ⏸ DEFER | Stripe stub |
| E7 | Host listing detail | 🟡 COPY | — |

---

## F. Booking & rental

| # | Экран | Решение | Комментарий |
|---|--------|---------|-------------|
| F1 | Booking + Stripe | ✅ KEEP | Borrow path OK |
| F1b | Buy checkout | 🔴 REDO PRODUCT | Sell mode first-class — P4 |
| F2 | Booking confirmed | 🟡 COPY | — |
| F3 | Rentals tab | 🟠 REDO UX | Rename → **Activity** / Bookings |
| F4 | Active rental | 🟡 COPY | 🟢 Mr. Evorios, QR |
| F5 | Disputes / reviews | ✅ KEEP | Minor copy |

---

## G. Profile & settings

| # | Экран | Решение |
|---|--------|---------|
| G1 | Profile | 🟠 REDO UX — garage identity, not «rental profile» |
| G2 | Identity | 🟢 |
| G3 | Co-hosts | 🟡 «Garage co-manager» |
| G4 | Delete account | 🟡 Wyoming legal name |

---

## H. Mr. Evorios (center nav)

| # | Surface | Решение | Статус |
|---|---------|---------|--------|
| H1 | Nav avatar + label | ✅ KEEP | 🟢 Mr. Evorios |
| H2 | Chat / FAQ | 🟡 COPY | 🟢 user strings |
| H3 | Component filenames | ⏸ DEFER | `RentanoChat.tsx` rename later |
| H4 | Mascot PNG | 🟠 REDO UX | **Новый арт Mr. Evorios** (см. assets) |
| H5 | System prompt | 🟢 | `evoriosPrompt.ts` |

---

## I. Infrastructure (не экран, но важно)

| Item | Решение |
|------|---------|
| `allbyrent_*` localStorage | ⏸ KEEP until migration |
| `rentals` table | ⏸ KEEP; optional rename `orders` |
| `app.allbyrent.com` → evorios.com | ⏸ DNS cutover |
| PWA icons | 🟠 NEW art `pwa-192/512` Evorios |
| Component prefix `Rentano*` | ⏸ refactor pass |

---

## 🎨 Asset manifest — какие картинки нужны

Замените файлы **с тем же путём** — код менять не нужно.

### Onboarding (`src/imports/onboarding/`)

| File | Экран | Статус | Art brief |
|------|--------|--------|-----------|
| `evorios_mr_full.png` | A2, A5 | 🟡 PLACEHOLDER | Mr. Evorios full body, green jacket, friendly wave; transparent or light bg |
| `evorios_garage_roles.png` | A2 scene | 🟡 PLACEHOLDER | Split: **My Garage** (open garage, shelves) vs **Browse** (walking the block); no «earn/save» |
| `evorios_stock_garage.png` | A3 card 1 | 🟡 PLACEHOLDER | Person stocking garage shelf / adding item to showcase |
| `evorios_browse_block.png` | A3 card 2 | 🟡 PLACEHOLDER | Person browsing phones or walking past neighbor garages |
| `evorios_on_block.png` | A4 home | 🟡 PLACEHOLDER | Suburban house + driveway, «on my block» GPS vibe |
| `evorios_trip_destination.png` | A4 trip | 🟡 PLACEHOLDER | Map pin / another neighborhood (US suburban) |
| `evorios_traveler.png` | A4b | 🟡 PLACEHOLDER | Lighter traveler with bag; optional ⏸ cut for US v1 |

### Splash & brand

| File | Экран | Статус | Art brief |
|------|--------|--------|-----------|
| `evorios_splash_garage.png` | A1b, art preview | 🟢 HAVE | Open garage + person + phone; **keep** — отлично подходит |
| `pwa-192.png` / `pwa-512.png` | Install | 🔴 NEED | Evorios mark or Mr. Evorios head; green #0D5C3A |
| `No_back_rentano.png` | Nav, hints | 🟡 LEGACY | Replace with `evorios_mascot_avatar.png` (круглый аватар) |

### Listing intro (`src/imports/`)

| File | Экран | Статус | Art brief |
|------|--------|--------|-----------|
| `listing_snap.png` | C2 slide 1 | 🔴 REDO | Photo on garage shelf, not generic phone |
| `listing_magic.png` | C2 slide 2 | 🔴 REDO | Mr. Evorios + auto-filled showcase card |
| `listing_share.png` | C2 slide 3 | 🔴 REDO | Neighbors viewing garage on block map |

### QR & share

| File | Экран | Статус | Art brief |
|------|--------|--------|-----------|
| `qr_story_1.png` … `3.png` | E2 | 🔴 REDO | Sticker on item in garage; Mr. Evorios guide |
| `qr_item.png` | E3 | 🟡 | Evorios branding on sticker |
| Share card backgrounds | E5 | 🔴 REDO | Evorios green, «Garage Showcase», evorios.com |

### Legacy — можно удалить после замены

| File | Was used for |
|------|----------------|
| `earn.png` | «I want to earn» |
| `save.png` | «I want to save» |
| `rentano_full.png` | Rentano hello |
| `allbyrent_roles.png` | Earn vs rent roles |

---

## Roadmap фаз (проактивный план)

### Phase 0 — **сейчас** (эта ветка)
- [x] Onboarding copy + asset paths
- [x] Mr. Evorios в UI-строках
- [x] Dynamic splash + evolution tagline
- [x] APP_CONCEPT + SCREEN_OVERHAUL docs

### Phase 1 — **картинки** (дизайн, без кода)
- [ ] 7 onboarding PNGs (таблица выше)
- [ ] Mr. Evorios avatar + PWA icons
- [ ] 3 listing intro slides

### Phase 2 — **Home & feed** (код)
- [ ] Browse: cards = neighborhood garages
- [ ] Item detail: shelf + mode badges
- [ ] Empty states: garage metaphor

### Phase 3 — **Commerce**
- [ ] Sell checkout (не только booking)
- [ ] Activity tab rename
- [ ] PDF filenames Evorios-QR-*

### Phase 4 — **evorios.com**
- [ ] Landing 3 evolution pillars
- [ ] DNS + manifest scope

---

## Как проверить утром

1. `?resetApp=1` → пройти онбординг: **Stock my garage** и **Browse the block**
2. Сравнить картинки с таблицей § Asset manifest (плейсхолдеры = старый earn/save)
3. Center nav → **Mr. Evorios** → FAQ / chat
4. Build stamp в Profile: коммит этой ветки

---

## Progress (обновляйте при проходе)

| Section | Copy | UX | Assets |
|---------|------|-----|--------|
| A Onboarding | 🟢 | 🟡 | 🔴 need art |
| B Browse | 🟡 | — | — |
| C My Garage | 🟡 | — | 🔴 listing intro |
| D Wizard | 🟢 hints | 🟡 modes | — |
| E Post-publish | 🟡 | — | 🔴 QR/share |
| F Booking | 🟡 | — | — |
| G Profile | 🟡 | — | — |
| H Mr. Evorios | 🟢 | 🟡 avatar | 🔴 |
| I Infra | 🟡 | — | PWA icons |

*Maintainers: после каждой фазы обновляйте таблицу и Evolution log в EVORIOS.md.*
