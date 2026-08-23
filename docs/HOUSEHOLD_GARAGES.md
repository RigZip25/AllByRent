# Household garages — product flow (Evorios)

**Last updated:** 2026-08-23

Canonical rules for “own garage + help next door.” FAQ copy lives in `faqEn` / `faqEs` / `faqCs` and is injected into Mr. Evorios via `buildEvoriosFaqKnowledge()`.

## Mental model (keep it simple)

1. **Everyone can have their own garage** (name, neighborhood, Personal/Pro, Stripe).
2. **An invite adds membership** to someone else’s garage — it does **not** delete yours.
3. **Working in** switcher (Garage tab) picks which shelf `+` / photos / drafts use.
4. **Browse / rent / Face ID** always follow the person signed in on that device.
5. **Live + Stripe** belong only to the **owner** of the active garage’s storefront.

## Flows

### A. First open (setup wizard)

1. Personal vs Pro  
2. Seats: just me / 1–3 helpers / more later  
3. Name + neighborhood label  
4. Optional invites (own emails) → copy link / mail  
5. Enter garage (active garage = yours)

### B. Accept invite (neighbor / family helper)

1. Sign in with the invited email  
2. Accept on Co-hosts  
3. App lands **Working in** that shared garage once (so the next photo goes there)  
4. Switcher can return to **My garage** anytime  
5. If you never named your own shop, Garage still offers your setup — you can own a home garage *and* help next door

### C. Barbara & daughter (two homes)

| | Barbara | Daughter |
|--|---------|----------|
| Own garage | Yes | Yes |
| Stripe | Barbara’s bank | Daughter’s bank |
| Help | Invite each other | Invite each other |
| Stocking | Switch **Working in** | Switch **Working in** |
| Browse | Own phone / login | Own phone / login |

### D. One household, one storefront

Dad creates garage → invites Mom / kids → they accept → usually leave **Working in** on the family garage. Own empty garage optional (no Live needed).

### E. Concurrent stocking

Same `owner_id` (active garage host) + unique listing ids → no conflict. Sync via Supabase; RLS allows active co-hosts to write that owner’s listings / photos (migration `045`).

## Code map

| Concern | Where |
|---------|--------|
| Active garage id | `resolveGarageHostId` / `setActiveGarageHostId` in `hostAccess.ts` |
| Switcher UI | `GarageActiveSwitcher.tsx` on `GarageScreen` |
| Shelf filter | `loadActiveGarageListings` / `fetchActiveGarageListings` |
| Live for helpers | `StoreLiveToggle` — read-only Live; no Stripe gate |
| Setup | `HouseholdGarageSetupScreen` |
| FAQ ids | `garage-switcher`, `own-and-help`, `stripe-garage-owner`, `browse-own-login`, updated `co-host` / `host-payouts` |

## Do not

- Auto-merge two homes into one garage without an invite  
- Pay helpers from the owner’s Connect  
- Treat “phone left unlocked as daughter” as Barbara’s Browse identity  
- Let helpers force-close the owner’s Live from an empty local cache  
