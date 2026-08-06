# Evorios — App Store & Google Play (Capacitor)

The web app at **app.evorios.com** is wrapped as a native shell with [Capacitor](https://capacitorjs.com/). Users install it from the stores like any other app, leave reviews, and get updates via store releases.

**Listing copy + age rating + screenshot shot list:** [store/LISTING.md](./store/LISTING.md)  
**Store icon 1024:** [store/app-icon-1024.png](./store/app-icon-1024.png)

## What was set up

| Item | Value |
|------|--------|
| Bundle / application id | `com.evorios.app` |
| Display name | Evorios |
| Version | 1.0 (versionCode 1) |
| Web assets | Bundled from `dist/` |
| API calls | `/api/*` → `https://app.evorios.com` on device |
| Deep links | `evorios://…` + `https://app.evorios.com/…` |
| Icons / splash | Generated from `resources/` via `@capacitor/assets` |
| In-app review | `src/lib/storeReview.ts` (`requestStoreReview`) |
| Platforms | `ios/` + `android/` |

Web PWA continues to work. Store builds skip the service worker (`CAPACITOR_BUILD=1`).

## One-time machine setup

1. **Node 20+**
2. **iOS:** full **Xcode** from the Mac App Store; open once; accept license
3. **Android:** **Android Studio** + SDK 35+
4. Apple Developer + Google Play Console (you have accounts)
5. Create listings:
   - App Store Connect → Bundle ID `com.evorios.app`
   - Play Console → package `com.evorios.app`

## Build & open native projects

```bash
cd /path/to/AllByRent
cp .env.example .env.local
# set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY (same as Vercel)

npm install
npm run build:native

npm run cap:ios      # Xcode → Product → Archive
npm run cap:android  # Android Studio → Bundle / APK
```

Regenerate icons after changing `resources/icon.png` / `resources/splash.png`:

```bash
npm run assets:generate
npm run build:native
```

## Store submission checklist

### Done in repo

- [x] Capacitor iOS + Android shell
- [x] App icons + splash (brand green + logo)
- [x] Privacy / Terms URLs documented (https://evorios.com/privacy.html · terms.html)
- [x] Age rating answers drafted in [store/LISTING.md](./store/LISTING.md)
- [x] Camera, Photos, Location, Microphone purpose strings + Android permissions
- [x] Stripe / auth return URLs use production origin on device
- [x] Custom scheme + App Links / Universal Links scaffolding
- [x] Listing copy ready to paste
- [x] In-app review helper
- [x] Starter screenshots in `docs/store/screenshots/` (replace with device shots before submit)

### You still do in the consoles (cannot automate without your login)

- [ ] Paste listing copy + upload icon `docs/store/app-icon-1024.png`
- [ ] Capture screenshots (shot list in LISTING.md) and upload
- [ ] Confirm age rating questionnaire in App Store Connect / Play
- [ ] Replace `TEAM_ID` in `public/.well-known/apple-app-site-association`
- [ ] Replace Play SHA-256 in `public/.well-known/assetlinks.json`, then redeploy
- [ ] Sign with your team in Xcode / Play App Signing
- [ ] TestFlight + Play internal testing, then submit for review

## Important

- **Passkeys** on native need Associated Domains + Team ID filled in; OTP / magic link work via the API bridge.
- UI changes in the WebView need `npm run build:native` + a new store binary. Pure `/api` Vercel hotfixes do not.
- Universal Links activate only after Team ID / SHA-256 are real and files are live on `app.evorios.com`.

