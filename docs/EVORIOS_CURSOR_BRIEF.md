# Evorios — Cursor Brief: ребренд + reshape из AllByRent

**Версия 1.0 | 17 июня 2026**

Как работает платформа, двусторонняя оценка (глобально vs причесать) и готовый промпт для Cursor.

**Статус реализации:** см. [EVORIOS_RESHAPE_STATUS.md](EVORIOS_RESHAPE_STATUS.md) (обновляется по мере работы).

---

## 1. Как именно работает Evorios

**Суть.** Соседский C2C-маркетплейс. У каждого домохозяйства — свой **Гараж** (личная витрина). Заходишь к соседу в гараж как на garage sale; у каждой вещи свой режим. Гиперлокально (кластер ~50 миль), на доверии, мод-нейтрально. Маскот **Mr. Evorios** = бренд, гид и единственный канал поддержки.

### Путь владельца (выложить)

1. Фото → агент (Claude vision) классифицирует: тип, атрибуты, grade, оценка стоимости, черновик описания.
2. Владелец подтверждает → публикация за ~30 секунд. Вещь падает в его Гараж.
3. На каждой вещи тумблер: **Сдам / Продам / Отдам** (можно несколько).
4. Тяжёлое (верификация, депозит, Stripe Connect) **НЕ** на этом шаге — срабатывает в момент включения «Сдам» или первой брони.

### Путь арендатора/покупателя (найти)

- **Поиск по нужде** — семантический (pgvector), переваривает любой кривой запрос, ищет по всем гаражам кластера. Под срочное («плиткорез в 5 милях»).
- **Browse** — единая лента, когда вещей мало (обилие); по мере наполнения раскладывается по отделам, **по каждому кластеру отдельно**.
- **Прогулка по гаражам** — листать витрины соседей ради любопытства (garage-sale-вайб → конверсия в сделку).

### Режимы

**Rent / Sell / Gift.** RTO убран. Sell + Gift — бесплатная фронт-дверь (налив). Rent — апселл поверх наполненного каталога. У Sell — настоящий buy-now (без календаря).

### Риск (Stage 1)

Только депозит, без страховки. Stripe authorization hold. Потолок стоимости (~$600) гейтит «Сдам» автоматически по оценке агента: выше — только Продам/Отдам. Везде «защита депозитом», не «страховка».

### Деньги

Листинг бесплатный. Доход — комиссия со сделки. Boost / страховка / подписки — Stage 2.

### Агенты

Классификация, оптимизация листингов, черновики — бесплатно в фоне. Платный бюджет ≈ 0 до данных по сделкам, хард-капы в коде. Оркестратор — Stage 2.

---

## 2. Двусторонняя оценка: глобально vs причесать

| Область | Что меняем | Оценка | На чём строим |
|---------|------------|--------|---------------|
| Бренд (AllByRent→Evorios, Rentano→Mr. Evorios) | Имя, манифест, index.html, splash, иконки, копи | **Причесать** | `brand.ts` уже централизован; ~100 файлов строк/ассетов, не логика |
| RTO из UI | Скрыть/выключить режим, поля, статусы | **Причесать** | enum в `types.ts` оставляем |
| Копи/нарратив (garage / household store / neighborhood) | Онбординг, home, empty states, FAQ | **Причесать** | существующие тексты |
| «Страховка» → «защита депозитом» | Релейбл + скрыть Safely в Stage 1 | **Причесать** | Safely-оценка уже в UI |
| Гараж как ядро | Витрина-страница + бейджи режимов + тумблеры + прогулка по гаражам | **Глобально** | есть профиль + листинги; надстраиваем витрину и навигацию |
| Семантический поиск | pgvector + эмбеддинги + query-embedding + similarity endpoint | **Глобально** | сейчас только keyword search |
| Динамическая таксономия | map-to-nearest, провизорные бакеты, промоушен по порогу | **Глобально** | есть Claude-анализ фото; логика воротов новая |
| Frictionless листинг | Схлопнуть 7-шаговый визард; отложить тяжёлое | **Глобально** | визард есть, реструктурируем |
| Sell buy-now | Покупка без календаря, отдельно от booking | **Глобально** | Sell в визарде есть; чекаут заточен под аренду |
| Лента: единая → отделы | Ранжирование по аренднопригодности, отделы по кластеру | **Среднее/глоб.** | home feed (Supabase + city + boost) есть |
| Депозит-онли + потолок | Мерж stripe-ветки + гейт «Сдам» по оценке агента | **Смешанное** | deposit hold готов на ветке (task 16) |

**Вне этого прохода (Stage 2):** платные бюджеты агентов, оркестратор-цикл, полная страховка (Safely/Tint), RTO, Twilio SMS, админка, host-аналитика, биллинг подписок, boost-чекаут. Оставить как есть / заглушки.

---

## 3. Промпт для Cursor (отдавать как есть)

Скопируй блок ниже целиком в Cursor. Задачи по порядку зависимостей. Коммить после каждой, билд должен проходить.

```
CONTEXT
We are rebranding AllByRent → Evorios (mascot: Mr. Evorios) and reshaping the
product into a neighborhood C2C "garage" marketplace.
Core model:
- Every user has a GARAGE: their personal storefront page. Browsing another
  user's garage feels like a garage sale.
- Each item has per-item modes: Rent / Sell / Gift. Rent-to-Own is REMOVED.
- Discovery: (a) semantic search across ALL garages in the user's ~50mi cluster,
  (b) a feed that is a single unified list when sparse and splits into departments
  PER CLUSTER as categories fill, (c) "browse neighbors' garages".
- Listing: photo → AI classifies & drafts the listing → publish in ~30s. Heavy
  steps (identity verification, deposit setup, Stripe Connect, value confirmation)
  are DEFERRED to the moment the user enables Rent or gets a first booking.
- Stage 1 risk = deposit only, NO insurance. Stripe authorization hold. Rent is
  gated to items whose AI-estimated value is under a configurable ceiling (~$600);
  above it, only Sell/Gift are available. Label everywhere "deposit protection",
  never "insurance".
- Money = transaction commission only. Listing is free, no listing fees.
- Keep agent/orchestrator scaffolding as background only; no paid agent spend.

Do NOT touch in this pass (leave as-is / stub): paid agent budgets, orchestrator
cron, full insurance integration, Rent-to-Own, Twilio SMS, admin panel, host
analytics, subscription billing, boost checkout.

TASKS (in order; commit after each; build must pass)

1. BRAND PASS (foundational)
   Make brand.ts the single source of truth: name "Evorios", mascot "Mr. Evorios",
   domain, primary color #0D5C3A, CTA #F59E0B. Replace all hardcoded "AllByRent"
   and "Rentano" references to read from brand.ts. Update manifest.json, index.html
   <title>/meta, splash, and PWA icon references. Keep the mascot character/assets;
   only the NAME changes (Rentano → Mr. Evorios).

2. REMOVE RTO FROM UI
   Hide/disable Rent-to-Own everywhere: mode toggle, pricing fields, status
   transitions, copy. Keep the enum value in types.ts for future use.

3. GARAGE VIEW
   Turn the user profile into a Garage storefront: header with the owner's
   name/photo/rating/trust badges, then a grid of their items. Each item card shows
   mode badges (Rent / Sell / Gift). In the owner's edit view, each item has
   per-item toggles "Sell this / Rent this / Gift this" (multiple allowed). Add a
   "browse neighbors' garages" entry point. Keep it lightweight (clean grid +
   header); no heavy theming yet.

4. FRICTIONLESS LISTING
   Restructure the existing 7-step wizard into a fast path: (1) add photo(s),
   (2) AI auto-generates the listing, (3) confirm + publish. Move identity
   verification, deposit setup, Stripe Connect, and value confirmation OUT of
   create and into a deferred "enable renting" step triggered when the user turns
   on Rent or receives a first booking. Target: live in ~30 seconds.

5. AI CLASSIFICATION + DYNAMIC TAXONOMY
   On photo upload, call Claude via /api/anthropic (Haiku-class vision, enable
   prompt caching on the taxonomy/system prompt) to return JSON:
   { category, subcategory, attributes[], grade, estimated_value, description }.
   Pin a controlled vocabulary: pass existing categories, instruct the model to MAP
   to the nearest one or propose a new label WITH a confidence score. If no good
   match, file the item in a "provisional" bucket (listing still goes live, fully
   searchable). Add a promotion job: when a provisional cluster reaches N items,
   flag for promotion to a canonical category and merge near-duplicate labels.

6. SEMANTIC SEARCH (pgvector)
   Enable the pgvector extension. For each listing, generate an embedding from
   description + attributes and store it. Build a search endpoint that embeds the
   query string and runs cosine-similarity search, filtered by the user's ~50mi
   cluster, tolerant of messy/typo'd queries. Make this the primary discovery path;
   keep keyword search as a fallback.

7. FEED LOGIC
   Feed defaults to a single unified list (ranked by rentability: value × likely
   demand, NOT recency/raw count) when the cluster is sparse. When a category
   passes N items IN A GIVEN CLUSTER, graduate it into its own department/shelf for
   that cluster only. Logic is per-cluster, never global. Let low-value "junk"
   exist but keep it out of the top of the storefront.

8. SELL BUY-NOW
   Give Sell a real buy-now purchase path, separate from the rental booking/calendar
   flow: instant purchase, no dates, no deposit (deposit/insurance apply to Rent
   only). Reuse existing Stripe payment plumbing.

9. DEPOSIT-ONLY + VALUE CEILING  (after merging the stripe branch / PR #16)
   Merge the Stripe payment + deposit branch into main. Wire deposit as a Stripe
   authorization hold: place on booking, release on confirmed return (QR scan),
   owner can claim within 48h, auto-release otherwise. Handle hold expiry (~7 days)
   with re-auth/capture for longer rentals, and the case where capture fails. Gate
   the Rent toggle by AI estimated_value: if value > CEILING (config, ~$600),
   disable Rent for that item (Sell/Gift only). Remove the insurance/Safely UI from
   the Stage 1 flow. Relabel any "insurance" copy as "deposit protection".

10. COPY / NARRATIVE PASS
    Rewrite onboarding, home, empty states, and FAQ around the garage concept:
    "your neighborhood's garage", "your household store", browse/rent/buy/gift from
    neighbors. Mr. Evorios speaks as a smart, warm concierge guide. No fake metrics
    in empty states — show a "post a request" prompt instead.
```

---

## 4. Прежде чем Cursor стартует (твои задачи руками)

| # | Задача | Блокирует |
|---|--------|-----------|
| 1 | **Выбрать клин-категорию и кластер ~50 миль** | Task 6, 7 — без этого код строится в вакууме |
| 2 | **Мерж PR #16 (stripe-ветка) в main** | Task 9 — ✅ уже в `main` (2026-05) |
| 3 | **Реальные ключи Stripe в Vercel** | Task 8, 9 |
| 4 | **Прогнать миграции 021–022 + pgvector** | Task 6, 9 |
| 5 | **Spend Management потолки в Vercel + бюджет-алерты в Anthropic** | Task 5 |
| 6 | **PhotoRoom: Startup-план** | Фото бесплатно на год |
| 7 | **Подключить GitHub агенту** | Чтение реального кода без сводок |
