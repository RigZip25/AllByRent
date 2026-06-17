# Evorios reshape — статус по Cursor Brief v1.0

**Обновлено:** 2026-06-17 (Home P0 shipped — [HOME_REDESIGN.md](HOME_REDESIGN.md))  
**Источник:** [EVORIOS_CURSOR_BRIEF.md](EVORIOS_CURSOR_BRIEF.md)

Легенда: ✅ готово · 🟡 частично · ⬜ не начато · 🚫 заблокировано

| # | Task | Статус | Что есть | Что осталось |
|---|------|--------|----------|--------------|
| 1 | **Brand pass** | 🟡 | QR PDFs, manifest, passkey, README, PWA strings | `Rentano*` file renames |
| 2 | **Remove RTO** | ✅ | Hidden in UI; rules off; enum in types | — |
| 3 | **Garage view** | 🟡 P0 | Garage tab, Garages lens, neighbor shelf | Storefront polish P1 |
| 4 | **Frictionless listing** | ⬜ | AI на фото в Step 2 | 7 шагов; QR после publish; тяжёлое не отложено |
| 5 | **AI + dynamic taxonomy** | 🟡 | `listingAnalysis.ts` → static categories | provisional buckets, promotion job, Haiku + prompt cache |
| 6 | **Semantic search** | 🚫 | ILIKE в `listingStorage.ts` | pgvector migration, embeddings, similarity API; **нужен кластер 50mi** |
| 7 | **Feed logic** | 🟡 P0 | Unified feed default, mode chips, sparse banner | Departments at N; ranking P1 |
| 8 | **Sell buy-now** | ⬜ | Sell mode в визарде | отдельный checkout без календаря |
| 9 | **Deposit + ceiling** | 🟡 | PR #16 merged: deposit hold, cron | value ceiling gate; hide Safely; «deposit protection» copy |
| 10 | **Copy / narrative** | 🟡 | onboarding, splash, top FAQ | wizard, rentals, item detail, empty states |

---

## Рекомендуемый порядок (после ручных блокеров)

```
1 Brand finish  →  2 Remove RTO  →  10 Copy (wizard/home)
        ↓
3 Garage view  →  4 Frictionless listing  →  5 AI taxonomy
        ↓
[кластер 50mi + pgvector migration]
        ↓
6 Semantic search  →  7 Feed logic  →  8 Buy-now  →  9 Deposit ceiling
```

---

## Ручные блокеры (владелец)

| Блокер | Статус |
|--------|--------|
| PR #16 Stripe в main | ✅ |
| Клин-категория + кластер ~50 mi | ⬜ **решение №1** |
| Stripe keys в Vercel | ⬜ проверить |
| Миграции 021–022 | ⬜ прогнать на prod |
| pgvector migration | ⬜ не создана |
| Anthropic spend caps | ⬜ |
| PhotoRoom startup | ⬜ |

---

## Связанные документы

- [EVORIOS.md](EVORIOS.md) — бренд и репо
- [GARAGE_SHOWCASE.md](GARAGE_SHOWCASE.md) — продуктовая метафора
- [FLOW_AUDIT.md](FLOW_AUDIT.md) — экран за экраном
- [SCREEN_OVERHAUL.md](SCREEN_OVERHAUL.md) — keep/redo + ассеты
