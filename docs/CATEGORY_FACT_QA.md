# CategoryFactCard — Q&A standard (Evorios)

**Last updated:** 2026-08-20

Every category and subcategory **FactCard** (`categoryFacts` in EN / CS / ES) must be **Question → short answer**. No essays, no meta commentary, no partner promo.

## Canonical shape

```ts
{
  title: "… rental FAQ",
  summary: "Short answers for …", // one line; optional in UI when qa present
  qa: [
    { q: "Clear renter/host question?", a: "1–2 sentences, actionable." },
    // typically 4–6 pairs
  ],
}
```

Rendered by `src/components/CategoryFactCard.tsx`:

- Collapsed by default (`defaultExpanded = false`)
- When `qa` is present, the card shows **Q** (semibold) + **A** only — essay fields (`whyGeo`, `flow`, `layers`, `claims`, `hostTip`, …) are ignored
- Prefer adding `qa` on every new shelf; do not revive long prose bodies

## Copy rules

| Do | Don’t |
|----|--------|
| One clear question per item | Meta (“why this FAQ”, “unlike…”, “we discussed…”) |
| 1–2 sentence answers | Multi-paragraph essays |
| Actionable gates (CDL, wipe, expiry, PPE…) | Marketing / partner hard-sell |
| EN + CS + ES in the same change | EN-only FactCard updates |

## Where data lives

| Locale | File |
|--------|------|
| EN | `src/lib/i18n/messages/en.ts` → `categoryFacts` |
| CS | `src/lib/i18n/messages/cs.ts` → `categoryFacts` |
| ES | `src/lib/i18n/messages/es.ts` → `categoryFacts` |
| Types | `src/lib/i18n/types.ts` → `categoryFacts.byCategory` / `bySubcategory` (`qa?: { q, a }[]`) |

Resolution order in the component: **subcategory** FactCard → commercial Vehicles shelf → category FactCard.

## Future category passes

1. Discover personal + pro subcategories for the shelf.
2. Encode gates in listing/booking code as needed.
3. Ship FactCards as **`qa` only** (this doc) — never essay `whyGeo` / `flow` / `layers` / `claims` blocks.
4. Typecheck; commit i18n carefully (serialize with other agents on `en.ts` / `cs.ts` / `es.ts`).

See also: [EVORIOS.md](./EVORIOS.md) (brand / product source of truth).
