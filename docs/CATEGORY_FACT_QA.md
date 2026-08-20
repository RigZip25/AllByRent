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
4. Typecheck with `npm run typecheck` (`tsc -b`); commit i18n carefully (**one encode agent at a time** on `en.ts` / `cs.ts` / `es.ts`).

## Spec option + field-label keys (shared maps — deploy blocker)

All listing `categorySpecs` select **values** share **one flat** `listing.categorySpecs.options` map per locale. Field **labels** share **one flat** `listing.categorySpecs.fields` map. Both are **global across every category**.

| Rule | Why |
|------|-----|
| **Option keys must be globally unique** | Duplicate keys → `TS1117` → Vercel `tsc -b` fails |
| **Field-label keys must be globally unique** | Same `TS1117` in the `fields` object |
| Prefer **scoped values** (`none_on_site`, `mixed_bag_tank`, `kind_coffee`, `glass_jar`) over bare `none` / `mixed` / `single` / `glass` / `coffee` when meanings differ | Bare `none` = trailer brakes; bare `mixed` = “Mixed yard”; bare `single` = “Single piece” |
| Before adding keys, **grep both maps** in `en.ts` | Parallel category writers thrash these maps |
| `bySubcategory` FactCards are nested **`bySubcategory[category][sub]`** | `"Other"` / `"Catering Equipment"` can differ per category |

**2026-08-20:** Real Estate clearance/`none`/Gym `ground_floor_easy` option collisions fixed (`e9f787a`). Home inject dropped colliding field labels (`kitInventoryChecklist`, `photoConditionChecklist`, `cateringSanitizeAttested`) — reuse existing global labels.

### Home & Kitchen (~8.0) — shipped pattern

| Layer | Pattern |
|-------|---------|
| Personal | Capacity + `kitchenReturnCleanPolicy`; food-contact shelves require `foodContactSanitizeAttested`; rich kits need `kitInventoryChecklist` |
| Pro | Voltage / NSF / install; commercial brew type + softener; catering heat/hold + dual sanitize; industrial phase; beverage plumb/CO₂ |
| Deposit | Damage + missing accessories — not food-safety insurance; NSF is host-declared |
| FactCards | Per-sub Q→A, collapsed; wire `subcategory` on listing/booking |
| Trust | `listingIsCommercialCoffee` in `categoryTrustRules.ts`; publish P0 in `areCategorySpecsValid` |

**Bottleneck learned:** injecting new field labels that already exist (even with different hints) breaks `tsc -b`. Prefer extending the existing label’s hint only when truly category-agnostic, or reuse as-is.

See also: [EVORIOS.md](./EVORIOS.md) (brand / product source of truth).
