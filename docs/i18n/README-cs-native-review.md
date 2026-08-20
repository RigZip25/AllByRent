# Czech native review pack

Generated for human (native) Czech translators.

## File

- `cs-native-review.tsv` — **2129** phrases
- Open in Google Sheets / Excel (UTF-8, tab-separated)
- Columns:
  - `flow` — screen / product area (translate in this order)
  - `key` — **do not change** (used to re-import)
  - `kind` — `string` or `fn` (placeholders like `{{1}}` must stay)
  - `english` — source of truth
  - `czech_current` — today’s app Czech (often literal; reference only)
  - `czech_native` — **fill this** with natural Czech

## Placeholders

Keep tokens unchanged: `{{1}}`, `{{2}}`, `{{mascot}}`, `%`, currency symbols if present, emoji if intentional.

## Suggested order

1. Brand + shared UI  
2. Onboarding / auth / install  
3. Home + listing detail  
4. List wizard + QR  
5. Garage + booking + rental handoff  
6. Yard sales  
7. Mr. Evorios + FAQ  
8. Rest  

## Counts by flow

- 00 · Brand: 2
- 00 · Brand / mode switch: 2
- 01 · Shared UI: 11
- 01 · Shared UI · bottom nav: 4
- 01 · Shared UI · location: 6
- 01 · Shared UI · system: 15
- 02 · Splash: 2
- 03 · Onboarding: 57
- 04 · Sign in / OTP: 57
- 04 · Sign in / passkey: 26
- 04 · Sign in prompt: 1
- 05 · Install / PWA: 95
- 06 · Set your block: 8
- 07 · Home / browse: 47
- 08 · Listing detail: 62
- 08 · Listing detail · shelf: 48
- 09 · List item · QR sticker: 58
- 09 · List item · share: 47
- 09 · List item wizard: 269
- 10 · Address picker: 16
- 10 · Host listing manage: 64
- 11 · My Garage: 51
- 12 · Request booking: 53
- 13 · Rentals list: 25
- 14 · Active rental / cards: 36
- 14 · Active rental / handoff: 95
- 14 · Booking request card: 9
- 14 · QR scan panel: 32
- 14 · Rental pricing: 9
- 14 · Rental status labels: 9
- 15 · Payments / Stripe: 20
- 16 · Garage cart / checkout: 24
- 16 · Open my garage (snap sale): 29
- 16 · Yard & garage sales: 264
- 17 · Mr. Evorios: 65
- 18 · How it works / catalog: 35
- 19 · Profile: 153
- 20 · More menu: 26
- 21 · Favorites: 8
- 22 · Messages: 8
- 22 · Peer chat: 6
- 23 · Post a request: 72
- 24 · Notifications: 79
- 25 · Feedback: 18
- 25 · Store review: 8
- 26 · FAQ answers: 98

## After translation

Send back the filled TSV (or only rows where `czech_native` is non-empty).  
We will merge into `src/lib/i18n/messages/cs.ts` (and FAQ / garage sale packs) by `key`.

## Also included (extra pack)

- `cs-native-review-extra.tsv` — categories, SEO nouns/meta, hardcoded UI, local chat hints
- `cs-native-review-complete.tsv` — **use this one sheet** for translators (app + extra)

See `README-cs-native-extra.md` for counts.
