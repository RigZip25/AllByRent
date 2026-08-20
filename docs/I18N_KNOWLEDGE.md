# i18n knowledge base — Category FactCards

**Last updated:** 2026-08-20

Canonical trust Q&A for category / subcategory shelves. Locales **inherit** English, then override — do not hand-duplicate every FactCard into each language forever.

## Architecture

```
src/lib/i18n/knowledge/
  types.ts                 # CategoryFactBlock, CategoryFactsBundle, Overlay
  categoryFacts.en.ts      # Assembles canonical EN from per-shelf modules
  mergeCategoryFacts.ts    # resolveCategoryFacts(overlay) → EN fallback
  categories/*.ts          # One EN FactCard per category (incl. VehiclesCommercial)
  subcategories/*.ts       # One EN map of subcategory FactCards per parent
  overlays/cs.ts           # Czech overrides (full today; may thin later)
  overlays/es.ts           # Spanish overrides
  index.ts                 # Public exports
```

Message catalogs wire it like this:

| Locale | `messages/*.ts` |
|--------|-----------------|
| EN | `categoryFacts: categoryFactsEn` |
| CS | `categoryFacts: resolveCategoryFacts(categoryFactsCsOverlay)` |
| ES | `categoryFacts: resolveCategoryFacts(categoryFactsEsOverlay)` |

`CategoryFactCard` still reads `t.categoryFacts` — no UI change. Resolution order inside the card is unchanged: subcategory → commercial Vehicles shelf → category.

## Fallback rules

`resolveCategoryFacts(overlay)`:

1. Chrome (`expand` / `collapse`): overlay string if present, else EN.
2. `byCategory[cat]`: overlay block if present, else EN. Partial block fields merge (`qa` from overlay wins when set).
3. `bySubcategory[cat][sub]`: same — missing shelf → EN.

A brand-new locale with an **empty** overlay still renders the full EN KB.

## How to add a new language (e.g. FR)

1. Add locale to `SUPPORTED_LOCALES` / `AppLocale` in `src/lib/i18n/types.ts`.
2. Copy a thin messages catalog (or start from EN structure).
3. Add `src/lib/i18n/knowledge/overlays/fr.ts`:

```ts
import type { CategoryFactsOverlay } from "../types";

export const categoryFactsFrOverlay: CategoryFactsOverlay = {
  expand: "En savoir plus",
  collapse: "Masquer",
  // Omit byCategory / bySubcategory at first → full EN fallback
  // Then translate shelves as you go:
  // byCategory: { Vehicles: { title: "…", summary: "…", qa: […] } },
};
```

4. In `messages/fr.ts`: `categoryFacts: resolveCategoryFacts(categoryFactsFrOverlay)`.
5. Export the overlay from `knowledge/index.ts` and register the catalog in `src/lib/i18n/index.ts`.
6. Ship UI chrome + high-traffic shelves first; leave the rest on EN until demand spikes (see [EVORIOS_CATEGORY_OPS.md](EVORIOS_CATEGORY_OPS.md)).

## How to deepen / edit FactCards

| Change | Where |
|--------|--------|
| EN canonical copy | `knowledge/categories/<Shelf>.ts` and/or `knowledge/subcategories/<Shelf>.ts` |
| CS/ES translation | `knowledge/overlays/cs.ts` / `es.ts` (or thin later) |
| Q&A shape rules | [CATEGORY_FACT_QA.md](CATEGORY_FACT_QA.md) |

Prefer **`qa: [{ q, a }]`** only. Do not revive essay fields.

## Spec options / field labels (not FactCards)

`listing.categorySpecs.options` and `.fields` remain **flat global maps** inside each locale’s `messages/*.ts`. Keys must be unique (`TS1117`).

- Documented pattern: [CATEGORY_FACT_QA.md](CATEGORY_FACT_QA.md) § Spec option + field-label keys
- CI: `npm run check:i18n-keys` (also runs from `npm run typecheck` and `prebuild`)

Future: the same overlay/fallback pattern can be applied to options/fieldLabels; until then, grep before adding keys and keep one encode agent at a time on those maps.

## Related

- [CATEGORY_FACT_QA.md](CATEGORY_FACT_QA.md) — Q→A standard + encode checklist
- [EVORIOS_CATEGORY_OPS.md](EVORIOS_CATEGORY_OPS.md) — spike → deepen one category fast
- [EVORIOS.md](EVORIOS.md) — product / brand hub
