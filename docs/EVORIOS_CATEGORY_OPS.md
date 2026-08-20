# Evorios category ops — spike → deepen

**Last updated:** 2026-08-20

**Strategy:** household neighborhood marketplace — **breadth first**. Ship every shelf with usable browse/list/rent; **deepen a category only when demand spikes** (bookings, searches, host complaints, support tickets). Do not mass-rewrite all category P1 gates.

## When to deepen

Trigger any of:

- Booking volume or search interest concentrates on one shelf
- Support / disputes cluster on missing gates (insurance, wipe, credentials)
- Hosts cannot publish because fields are too vague or too heavy
- A locale market (CS/ES/…) needs local-law copy on that shelf first

Non-triggers: “feels incomplete,” parallel encode curiosity, partner promo ideas.

## Fast deepen checklist (one category)

Work **one category at a time**. Never parallel-edit shared `options` / `fields` maps across agents.

### 1. Scope

- [ ] Name the category + which **subcategories** spike (not the whole tree unless needed)
- [ ] Decide personal vs pro gates (what blocks publish / handoff)
- [ ] Confirm deposit story (damage / missing kit — not product insurance)

### 2. Product gates (code, only as needed)

- [ ] Listing wizard fields for that shelf (`categorySpecs`)
- [ ] Booking / handoff checks (credential, wipe, COI, photos…)
- [ ] Trust helpers if needed (`categoryTrustRules`, rent rules)
- [ ] Wire `subcategory` into listing + booking so FactCards resolve

**Do not** reopen every other category’s P1 gates in the same PR.

### 3. FactCards (canonical KB)

- [ ] Update **EN** in `src/lib/i18n/knowledge/categories/` and `subcategories/`
- [ ] Shape: **`qa: [{ q, a }]` only** — see [CATEGORY_FACT_QA.md](CATEGORY_FACT_QA.md)
- [ ] Collapsed by default; no Tint / partner hard-sell
- [ ] CS/ES: override in `knowledge/overlays/*.ts` for changed shelves (missing keys keep EN via [I18N_KNOWLEDGE.md](I18N_KNOWLEDGE.md))

### 4. Shared maps (deploy blocker)

- [ ] New option values: **globally unique** keys (prefer `scoped_snake`)
- [ ] New field labels: reuse existing global labels when possible
- [ ] Run `npm run check:i18n-keys` (also in `typecheck` / `prebuild`)
- [ ] One encoder on `en.ts` options/fields at a time

### 5. Ship

- [ ] `npm run typecheck` clean
- [ ] Smoke: category FactCard on listing + booking for a spiked sub
- [ ] Commit message names the category + ~depth (e.g. “Raise X subs to ~8.0”)
- [ ] No Tint promo; no drive-by refactors

## Breadth vs depth (ops heuristic)

| Mode | Do | Don’t |
|------|----|--------|
| Breadth (default) | Keep shelves listable; light FactCards; unique keys | Deep P1 on quiet categories |
| Spike deepen | One category end-to-end (gates + EN KB + CS/ES overlay) | Touch every locale’s entire catalog |
| New language | Inherit EN KB; translate chrome + spiked shelves | Require full FactCard parity day one |

## Owners / pointers

| Topic | Doc / path |
|-------|------------|
| Q→A FactCard standard | [CATEGORY_FACT_QA.md](CATEGORY_FACT_QA.md) |
| Locale inheritance | [I18N_KNOWLEDGE.md](I18N_KNOWLEDGE.md) |
| Brand / product hub | [EVORIOS.md](EVORIOS.md) |
| Canonical FactCards | `src/lib/i18n/knowledge/` |
| Unique key CI | `scripts/check-i18n-unique-keys.mjs` |

## Anti-patterns

- Parallel PRs thrashing `listing.categorySpecs.options` / `fields`
- EN-only FactCard updates without overlay path (new langs should still inherit EN)
- Essay FactCards (`whyGeo` / `flow` / `layers` / `claims`)
- Partner insurance / Tint promo in collapsed cards
- “Deepen everything” before demand signal
