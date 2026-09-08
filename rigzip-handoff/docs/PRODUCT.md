# RigZIP — Product & handoff brief

Source session: Cloud Agent «Флоу, дизайн, скрины»  
https://cursor.com/agents/bc-01a07d2b-3826-7ced-af85-c556fe516cb4  

**Do not copy the old RigZip-UAT / contractor UI.** Refs in `docs/refs/` are for **flow & domain only**. Visual direction = premium industrial rebuild.

---

## Product

**RigZIP** ≈ Turo for **commercial** trucks/trailers/specialized equipment (US pros).

Audience: small owners with idle iron, owner-operators, small fleets — not Penske/Ryder replacement, a tool that lets small players operate professionally.

### Dual sided
- **Tenant (rent):** find capacity
- **Owner (list):** monetize idle fleet

### Differentiator vs consumer truck rental
Unit is added to the **renter’s insurance** for the trip (loss payee / additional insured + unit-specific COI). Platform prepares insurance doc packs; PTI gates keys.

### Commercial-only gate
List as individual or business. To **rent**: valid commercial authority (MC/DOT as applicable) + appropriate insurance.

---

## Auth
- **Email OTP only** (6 digits, ~10 min expiry, resend cooldown). **No Twilio / SMS.**
- Individual | Business account type
- Assigned driver: no full account required; verify via **email link** after booking

---

## Catalog taxonomy (US GVWR)
- Light-Duty ≤ 14,000 lbs
- Medium-Duty ≤ 26,000 lbs
- Heavy-Duty > 26,000 lbs
- Semi-Trailers (box/covered, flatbed/drop deck, dump & construction, …)
- Specialized equipment
- Electric work fleet (under light / specialty)

Owner listing wizard historically **8 steps** (category → VIN → … → loss payee & valuation). Rebuild UX; keep domain fields.

### VIN
Decode/auto-fill make/model/year/engine/etc. (NHTSA vPIC + richer provider later). Success/fail states.

---

## Booking & money
- Durations: **hour / day / week / month**
- Hourly: configurable **minimum charge** (e.g. 10h), max window (e.g. 24h); early return still pays minimum
- Pricing breakdown: rental + security deposit + platform fee + Stripe fee
- Promo codes
- Stripe Checkout / Link OK for **payments**; login OTP stays email
- Deposit refundable if returned in original condition

### Booking statuses
All · Request · Closure · Up-Coming · On-Going · Cancelled · Past · Extension  
UI status example: **PTI Pending**

### Cancellation (vs PTI)
Default: 24h+ before PTI 100% · 5–24h 75% · under 5h 10%

---

## Insurance / COI / claims
- Owner listing: Loss Payee name/address, Physical Damage Valuation, remarks
- Renter: Profile COI + MC Authority; unit-specific COI ≤ **5 hours** before start; owner approval
- Requirements example: Liability $1M, Physical Damage $100K, Loss Payee, Additional Insured = owner
- Sample ACORD 25 style COI
- **Damage claim** flow + full packet for carrier (contract, PTI/return photos, COI, valuation, police/incident)
- CDL required flag per unit class where needed

---

## PTI / show-up / delivery
- Pre-trip inspection gates trip start (Pass / Minor hold / DOT fail)
- **Minor:** repair + re-PTI in window
- **DOT/safety fail:** cancel as **owner fault**, full refund tenant, **penalty to owner**, unit unavailable until cleared
- After-hours pickup (lockbox / smart lock / code)
- Delivery optional (fee + SLA)
- Post-trip inspection vs PTI evidence
- Mileage / trip map later (geofence optional)

### Driver
Booker may assign another driver; re-verify; mid-trip replace supported in model.

---

## Scale / bottlenecks to design for
COI approval SLA + timeout · calendar hard-lock / buffers · owner latency auto-actions · email+push inbox (not email-only alerts) · search geo+availability indexes · extension vs next booking · Stripe Connect payouts · dispute evidence packs · stale inventory · tractor+trailer combo · US timezones · fraud (fake COI, VIN reuse)

### Open product questions (ask owner if blocking)
1. Who approves COI — owner, platform, or both?
2. Owner PTI-fail penalty — flat $ or %?
3. Deposit — auth hold vs charge+refund?
4. After-hours — smart lock required or lockbox OK?
5. Delivery in v1?
6. Tractor+trailer combo in v1?
7. Stripe Connect from day one?
8. Hourly minimum — global or per listing?
9. Replacement unit obligation on fail?
10. Launch geography — all US or pilot states?

---

## Owner growth
Share listing deep links + OG for social; garage/fleet page; optional boost later.

---

## Design direction (new)
- Premium industrial: ink/steel, amber accent `#F2B90D`, Syne + DM Sans
- Brand **RigZIP** hero-level on entry
- No cartoon clipboard people, no emoji greetings, no dense 3-col contractor catalog as primary UI
- Refs = flow only

### Frontend already started (this handoff)
Working Vite React shell screens:
1. Splash  
2. Choose path (Rent / List)  
3. Commercial gate  
4. Email + OTP  
5. Explore (class rail + nearby units + bottom nav)

Code lives under this package root (`src/`, `docs/refs/`). After monorepo merge, place UI in `web/` and keep `server/` as API stub.

### Repo note
`RigZip25/RigZipnew` setup PR scaffolds `server/` + `web/` workspaces + `.cursor/environment.json`. Replace demo `web/` with this premium shell; evolve `server/` toward real domain API.

---

## Prior contractor stack (do not continue)
~2 years, 42 TestFlight builds (`RigZip-UAT`), `rigzip.com` old CRA on S3. Decision: **greenfield** product/code; keep taxonomy/domain ideas only.
