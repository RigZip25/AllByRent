# AllByRent — Project Context for Cursor

## What we're building
AllByRent — The Social Rental Network. Mobile-first PWA (Progressive Web App).
Any household can list physical items for rent, sell, rent-to-own, or gift.
Target: mobile browser, installed as PWA (no App Store, no Google Play by design).
Reason: avoid store commissions on subscriptions (Stripe only, ~2.9%).

## Stack
- React + TypeScript + Tailwind v4 + Framer Motion
- Vite (build tool)
- pnpm (package manager)
- Path: C:\Users\Ed\Downloads\AllByRent Mobile App UI
- GitHub: RigZip25/AllByRent
- Dev: pnpm dev → localhost:5173

## PWA — required from the start
- Run once: `npm install -D vite-plugin-pwa` (then swap `src/main.tsx` to `import { registerSW } from "virtual:pwa-register"`)
- vite-plugin-pwa configured in vite.config.ts (loads when package is installed)
- manifest.json: name "AllByRent", short_name "AllByRent",
  theme_color "#0D5C3A", background_color "#ffffff",
  display "standalone", orientation "portrait"
- Service worker: cache static assets, offline fallback screen
- Icons: 192×192 and 512×512 (Rentano character, green jacket)
- HTTPS required for PWA — deploy target: Vercel or Netlify
- iOS: PWA install prompt + iOS 16.4+ push notification support
- Android: full PWA support including push notifications

## Backend (planned, not yet connected)
- Supabase Auth (email / Google / Apple / magic link + SMS via Twilio)
- Supabase Storage (item photos)
- Supabase Realtime (chat messages, encrypted)
- Stripe Elements (renter card, never touches our servers)
- Stripe Connect (owner bank account + payouts)
- Stripe Identity (ID verification, one-time per account)
- Stripe Authorization holds (security deposit)
- Safely API (rental insurance, auto-applied to Rent + RTO)
- Claude API via Vite proxy /anthropic-api/ (Rentano AI + photo analysis)
- PhotoRoom API (background removal on listing photos)
- Nominatim API (city search via dev proxy `/nominatim`; US uses Census + Photon)
- StickerMule API v2 (vinyl QR stickers by mail)
- NHTSA API (VIN verification, v2 vehicles category)

## API keys (in .env.local, never commit)
VITE_ANTHROPIC_API_KEY
VITE_PHOTOROOM_API_KEY

## Brand
- Primary green: #0D5C3A
- CTA amber: #F59E0B
- Mascot: Mr. Rentano (green jacket, hat, glasses, bow tie)
- No other mascots or symbols
- Illustrations in src/imports/

## App modes (Home Feed)
Two modes toggled in top bar, saved to localStorage:
- [Earn] — Host Dashboard: listings, income, requests
- [Rent] — Browse: categories, search, bookings
Onboarding sets starting mode: Earn path → Earn mode, Save path → Rent mode

## Onboarding flow
Splash (green motion, Rentano) → FirstHello → WhatDoYouWant →
  [Earn] → ListingIntro → Listing Wizard
  [Save] → WhereAreYou →
    [At home] → Home Feed (Rent mode)
    [Traveling] → WhereAreYouHeading → Home Feed (Rent mode)
"You are all set" screen — done (before Home Feed on Rent path)

## Listing Wizard — 7 steps
Step 1: Photos (min 1, max 5, PhotoRoom BG removal, Claude Vision analysis)
Step 2: Item Info (title, category, subcategory, grade, condition,
         description, replacement value, instructions URL)
         — AI autofills all fields from photo analysis on Continue
Step 3: Transaction Modes (Rent / Sell / Rent to Own / Gift + pricing)
         — calculateRentalPrices() from listingItemCategories.ts
Step 4: Pickup & Delivery (in-person / contactless / delivery by miles)
         — hours/days of week are in Profile Setup, not per listing
Step 5: Availability (blocked date ranges + pause listing toggle)
Step 6: QR Code (generated after publish, Avery #94107 PDF)
Step 7: Review & Publish (card preview + step summary + confetti + publish)

## Listing status flow
Rent / Rent to Own:
  publish → "pending_sticker" → owner prints PDF sticker →
  verification photo (camera only, not gallery) → "active" → visible in feed
Sell / Gift:
  publish → "active" immediately

## Post-publish flow (after Step 7)
QR Story Screen (3 slides, camera illustrations) →
Verification photo screen →
Share screen (Claude API generates caption, native Share Sheet) →
Boost screen ($2/24h, $5/7d, $10/30d)

## Profile Setup (separate flow, not in wizard)
- Stripe Identity verification (required before first listing goes live)
- Working hours + days (default 9am–5pm Mon–Fri)
- Pickup preferences (in-person / contactless / delivery radius)
- Stripe Connect bank account (required before first payout)

## Categories
20 categories × Personal / Professional grade
Each category: 6 subcategories (last one always "Other")
File: src/screens/listing/listingItemCategories.ts
Pricing coefficients from real market × 0.85 (15% cheaper)
Long-term base: month (Electronics, Furniture, Home & Kitchen)
Short-term base: day (Tools, Photo & Video, Party & Events)

## Transaction modes
RENT: daily/weekly/monthly rate + optional security deposit.
  Insurance via Safely API auto-applied. Stripe hold for deposit.
SELL: sale price only. No insurance. Platform commission.
RENT TO OWN: total price + months → auto-calculates monthly payment.
  Insurance full duration. Grace period 5 days on default.
GIFT: free. No commission, no insurance, no deposit. Active immediately.

## Security model
- AllByRent stores minimum data only
- Passwords: never (Supabase Auth hashed)
- Identity docs / selfie: never (Stripe Identity only)
- Card data: never (Stripe Elements, store stripe_customer_id only)
- Bank account: never (Stripe Connect, store stripe_connect_account_id only)
- Platform is neutral — provides data, does not arbitrate disputes

## Subscriptions (Stripe, not in-app purchase)
Free: 3 listings, 3 photos each
Starter: $4.99/month, up to 10 listings
Pro: $9.99/month, up to 20 listings
Business: $19.99/month, up to 30 listings
4th and 5th photo: $0.10 each, charged at publish

## Mr. Rentano — AI companion
Powered by Claude API (claude-sonnet-4-20250514)
Only support channel — no human agents, no tickets
Responds in user's language automatically
Context object injected per request (screen, step, userRole, draft, userId)
System prompt in: src/lib/rentanoPrompt.ts
Appears: onboarding, every wizard step, disputes, overdue, no-show

## Current TODO (priority order)
1. QR Story Screen (after publish — partial in wizard)
3. Verification photo screen
4. Share screen
5. "You are all set" onboarding screen
6. Profile Setup flow
7. Rentano live chat (Claude API with context object)
8. Supabase connection

## Documents in project
AllByRent_ListItem_Flow_v1.docx — listing wizard full spec
AllByRent_Security_Auth_v1.docx — auth, payments, identity, disputes
AllByRent_Rentano_SystemPrompt_v1.docx — Rentano character, prompt, FAQ
