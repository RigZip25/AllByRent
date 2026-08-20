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

### Music & Audio (~8.0) — shipped pattern

| Layer | Pattern |
|-------|---------|
| Personal | Instrument form/case/strings/cable; keyboard type/keys/stand; drums pieces+hardware; speaker splash+battery return; mic type+phantom+hygiene wipe |
| Pro | Amp tube/SS + cab; mixer channels+powered; monitors pair+stands; PA inventory+speaker count+outdoor policy; recording I/O |
| Deposit | Scuffs + missing accessories vs frozen inventory — not backline insurance |
| Boundary | Live stacks/instruments here; Electronics **Pro Audio** stays studio capture |
| FactCards | Per-sub Q→A EN/CS/ES; wire `subcategory` |

**Option scoping:** `instrument_wireless_only` (not bare `wireless_only`, which means network gear).

### Office & Business (~8.0) — shipped pattern

| Layer | Pattern |
|-------|---------|
| Furniture | Type, size/seats, condition — **no** device wipe |
| Devices | `deviceHasStorage` + wipe when `has_storage`; POS unknown/storage and Servers always wipe |
| Pro | Large-format width/ink; POS payment readiness; copier duty/finishers; conference seats; server form + rack notes |
| Deposit | Physical damage + missing kit — not cyber insurance |
| FactCards | Per-sub Q→A; subcategory already wired on listing/booking |

### Outdoor & Camping (~8.0) — shipped pattern

| Layer | Pattern |
|-------|---------|
| All | `personCapacityBand` + `seasonRating` |
| Shelter/sleep | Hygiene attest on tents/bags/expedition/group shelters; tent pole type |
| Packs | Volume + frame |
| Cook/nav | Stove fuel; nav device + battery policy |
| Survival/base | Kit class + waiver; base-camp band |
| FactCards | Already per-sub Q→A — wire `subcategory` on listing/booking |


### Photo & Video (~8.0) — shipped pattern

| Layer | Pattern |
|-------|---------|
| All | Brand+model, kitIncludes, kit inventory multiselect; serial required category-wide |
| Bodies | Sensor/mount class + capture media include (Camera/Action/Cinema) |
| Support | Tripod payload + head; stabilizer type + payload |
| Light | Kit class + power source (Basic + Studio) |
| Lenses | Mount + focal band |
| Broadcast | Device subtype + media include |
| Drones | Weight class + Remote ID (existing P0) |
| FactCards | Per-sub Q→A EN/CS/ES; wire subcategory on listing/booking |

### Sports & Recreation (~8.0) — shipped pattern

| Layer | Pattern |
|-------|---------|
| All | `sizeOrLength` + `skillLevel`; kit checklist recommended |
| Snow | `snowGearForm` + DIN + helmet + waiver |
| Water / Pro Water | `waterCraftClass` + PFD + waiver |
| Racket / Skating / Fishing | Sport-specific type/class gates |
| Pro | Competition class; coaching aid; timing system; team kit band + inventory |
| Other | `sportsOtherKind` + checklist |
| Deposit | Gear damage / missing pieces — not injury insurance |
| FactCards | Per-sub Q→A; wire `subcategory` |

**Option scoping:** prefix `sports_*` on all new option ids.

### Tools & DIY (~8.0) — shipped pattern

| Layer | Pattern |
|-------|---------|
| All | `powerSource` (+ voltage when relevant); kit checklist recommended |
| Hand / Paint / Other | Class + `toolSetBand`; sets require checklist |
| Drills | `drillToolClass` (personal + industrial) |
| Measure / Laser | Class gates |
| Ladders | Height + duty rating |
| Weld / Scaffold / Saws | Existing PPE/height/load + safety briefing ready |
| Deposit | Missing bits/guards — not injury insurance |
| FactCards | Per-sub Q→A; wire `subcategory` |

**Option scoping:** prefix `tools_*` on new option ids. Reused `toolSetBand` with category-agnostic hint.

### Real Estate (~8.0) — verified

Profile + per-sub FactCards + subcategory wiring already shipped (`bfb116d`). Generic required-field validation + `houseRules` gate.


### Unique & Other (~8.0) — shipped pattern

| Layer | Pattern |
|-------|---------|
| All | `useCase` + `transportSize` + `uniqueFragilityBand` |
| Collectibles / Art | Authenticity or medium |
| Hobby / Props / Specialty / Custom / Other | Class + kit checklist |
| Unusual / Seasonal / Oddities / Rare instruments | Class gates |
| Boundary | Prefer named categories when they fit (Music for standard instruments, Party for party kits) |
| Deposit | Damage/missing — not collectible/art/instrument insurance |
| FactCards | Per-sub Q→A; wire `subcategory` |

**Option scoping:** prefix `unique_*` on new option ids.

See also: [EVORIOS.md](./EVORIOS.md) (brand / product source of truth).
