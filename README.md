# MyFantasticTrip

AI-powered personal travel companion PWA — natural-language trip planning, bookings, packing, group sync, and live in-trip guidance.

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS v4 + Zustand
- DM Sans · dark amber/gold design system
- Supabase schema prepared (`supabase/migrations/010_myfantastictrip.sql`)
- PWA via vite-plugin-pwa

## Run

```bash
npm i
npm run dev
```

Open `http://localhost:5173/`. First visit starts at `/welcome`.

## Flows

1. **Onboarding** — welcome → interests → profile
2. **Discovery** — home → world map → destination
3. **Trip creation** — voice/text AI match → overview → booking
4. **Preparation** — packing · group · countdown
5. **In-trip** — live day · restaurants · translator · summary · memories

Reset demo data: `?resetApp=1`
