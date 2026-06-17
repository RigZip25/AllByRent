# Evorios — task board

**Обновлено:** 2026-06-17  
**План:** [EVORIOS_CURSOR_BRIEF.md](EVORIOS_CURSOR_BRIEF.md) · **Home:** [HOME_REDESIGN.md](HOME_REDESIGN.md) · **Статус:** [EVORIOS_RESHAPE_STATUS.md](EVORIOS_RESHAPE_STATUS.md)

---

## Для Cursor (агент) — очередь работ

Коммит + push + `npm run build` после каждого блока. Ветки: `cursor/<name>-ca09`.

| Приоритет | Task | Статус | Следующий шаг |
|-----------|------|--------|----------------|
| P0 | Home redesign | ✅ | — |
| **P1a** | **Remove RTO from UI** | ✅ | — |
| **P1b** | **Brand pass (strings)** | 🟡 | QR PDFs, manifest, passkey; Rentano* files defer |
| **P1c** | Copy pass (wizard, FAQ, empty) | 🔄 | Step3 titles Borrow/Buy/Gift |
| P1d | Deposit-only UI (hide Safely) | ⬜ | BookingScreen, Step3 ModeNote |
| P2 | Frictionless listing (3-step) | ⬜ | Отложить verify/Stripe из wizard |
| P2 | Garage storefront polish | ⬜ | Public profile = vitrina |
| P2 | Feed ranking + departments | ⬜ | N items per cluster |
| P3 | Semantic search (pgvector) | 🚫 | Нужен кластер + migration |
| P3 | Sell buy-now checkout | ⬜ | Отдельно от booking |
| P3 | Map lens | ⬜ | Stage 2, после плотности |
| defer | Rename `Rentano*` files | ⬜ | Отдельный refactor PR |

### Текущий спринт (агент)

1. ✅ Home P0 (`a9bca4b`)
2. ✅ Task 2 — RTO out
3. 🔄 Task 1 — brand strings (partial)
4. 🔄 Task 10 — wizard/FAQ copy

---

## Для тебя (владелец) — блокеры

Без этого часть фич останется заглушкой на prod.

| # | Задача | Блокирует | Статус |
|---|--------|-----------|--------|
| **1** | **Клин-категория + кластер ~50 mi** (решение №1) | pgvector, feed departments, ranking | ⬜ |
| 2 | Stripe keys в Vercel (`STRIPE_*`, `CRON_SECRET`) | реальные платежи/депозит | ⬜ проверить |
| 3 | Прогнать миграции 021–022 на prod Supabase | deposit cron | ⬜ |
| 4 | pgvector migration (когда будет кластер) | semantic search | ⬜ |
| 5 | Anthropic spend caps + Vercel budget alerts | AI classification prod | ⬜ |
| 6 | PhotoRoom Startup plan | фото без лимита | ⬜ |
| 7 | GitHub доступ агенту (опционально) | review без сводок | ⬜ |

**PR #16 Stripe** — ✅ уже в `main`.

---

## Как проверить локально

```bash
git pull origin main
npm ci
npm run build
npm run dev
```

| Сценарий | URL |
|----------|-----|
| Полный сброс | `http://localhost:5173/?resetApp=1` |
| Splash | `?screen=splash&dynamic=1` |
| Home P0 | после онбординга → Feed + search-hero |

**Build stamp:** Profile → первые 7 символов commit SHA.

---

## Автономность приложения

| Слой | Сейчас |
|------|--------|
| Frontend | ✅ Vite PWA, localStorage demo, Supabase optional |
| Auth | ✅ Magic link + passkey (если Supabase настроен) |
| Listings | ✅ Wizard + AI analyze (нужен `ANTHROPIC_API_KEY` на Vercel) |
| Payments | 🟡 Stripe в коде; нужны live keys |
| Search | 🟡 ILIKE; pgvector позже |

Деплой: push `main` → Vercel auto-deploy.
