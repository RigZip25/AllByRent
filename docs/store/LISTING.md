# Store listing copy (paste into App Store Connect / Play Console)

**Icon (1024×1024):** `docs/store/app-icon-1024.png`  
**Privacy:** https://evorios.com/privacy.html  
**Terms:** https://evorios.com/terms.html  
**Support / Marketing:** https://evorios.com · support@evorios.com  
**iOS Bundle ID:** `com.elflogistics.evorios`  
**Android package:** `com.evorios.app`

## App name

Evorios

## Subtitle (Apple, ≤30 chars)

Neighborly marketplace

## Short description (Play, ≤80 chars)

Rent, sell, or gift from your garage — neighbor marketplace.

## Promotional text (Apple, optional)

Open your garage storefront. Browse the block. Borrow, buy, or gift nearby.

## Full description

Evorios is a neighborly marketplace where every home can be a business cell.

Open your Garage Showcase to list tools, gear, and everyday items — rent them out, sell them, or gift them on the block. Browse nearby storefronts when you need something for a project, a party, or a weekend trip.

Features:
• List with photos and clear pricing for rent, sale, or gift
• Browse neighborhood garages sorted by distance
• Secure payments and seller payouts with Stripe
• Identity and payout onboarding for hosts
• Share listings and garage storefronts with a link or QR

Download Evorios and turn your home into a storefront your neighbors can actually use.

## Keywords (Apple, comma-separated, ≤100 chars)

rent,marketplace,neighbors,garage,sell,borrow,tools,local,yard sale

## Category

Primary: Shopping  
Secondary: Lifestyle / Social Networking

## Age rating (questionnaire guidance)

Typical answers for this marketplace (review & adjust in console):

| Topic | Suggested |
|-------|-----------|
| Unrestricted web access | No |
| Gambling | No |
| Contests | No (unless you add contests later) |
| Parental controls | No |
| Violence / horror | None |
| Sexual content / nudity | None |
| Profanity | Infrequent/Mild (user chat — review carefully) |
| Alcohol / tobacco / drugs | None in app; user listings may vary — use “Infrequent/Mild” only if your policy allows such listings |
| Mature / suggestive themes | None |
| Medical / treatment info | None |
| Horror / fear themes | None |

Expected overall band: **4+ / Everyone** if listings stay family-safe; raise if user-generated listings can include mature goods.

## Screenshot shot list (capture on device / Simulator)

Starter web captures (phone viewport) are in `docs/store/screenshots/` — replace with signed-in device shots before submission.

Use a real iPhone and Android phone (or simulators). Prefer light UI, logged-in demo with sample garage listings.

1. Home / Browse near me  
2. Garage storefront (earn mode)  
3. Listing detail with price  
4. Create listing / camera flow  
5. Checkout or rental request  
6. Profile / payouts (Stripe Connect ready)

iPhone sizes commonly required: 6.7" and 6.1" (or current App Store Connect set).  
Play: phone screenshots 16:9 or device frames per console.

Query helpers on web (same UI for mock frames):  
`https://app.evorios.com/?skipSplash=1`

## After first upload

1. Replace `TEAM_ID` in `public/.well-known/apple-app-site-association` with your Apple Team ID  
2. Replace Play signing SHA-256 in `public/.well-known/assetlinks.json`  
3. Redeploy app.evorios.com so Universal Links / App Links verify  
4. In Xcode: Signing Team selected; Archive → TestFlight  
5. In Android Studio: Generate Signed Bundle → Play internal testing
