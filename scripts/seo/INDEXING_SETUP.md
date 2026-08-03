# Programmatic indexing setup (evorios.com)

ChatGPT / Bing often “can’t find” the site because **search indexes are empty**, not because the site is down. This folder automates what we can; Google/Bing property verification is one-time in the browser.

## 1. Deploy sitemap + IndexNow key (AllByRent-Web)

From this app repo:

```bash
npm run seo:sitemap
```

Copy into **AllByRent-Web** root (marketing site):

| From (AllByRent) | To (AllByRent-Web) |
|---|---|
| `scripts/seo/allbyrent-web/sitemap.xml` | `sitemap.xml` |
| `scripts/seo/allbyrent-web/cc7fe5b481b3f86045692de807516ca6.txt` | `cc7fe5b481b3f86045692de807516ca6.txt` |
| `scripts/seo/allbyrent-web/robots.txt` | `robots.txt` (already has Sitemap line) |

Confirm live:

- https://evorios.com/sitemap.xml — includes `/cs/`, `/ru/`, …  
- https://evorios.com/cc7fe5b481b3f86045692de807516ca6.txt — raw key string

## 2. Ping IndexNow (Bing, Yandex, …)

After the key file is live:

```bash
# smoke: homepage + a few locales
npm run seo:indexnow -- --urls=https://evorios.com/,https://evorios.com/ru/,https://evorios.com/uk/,https://evorios.com/de/,https://evorios.com/es/

# full sitemap (may batch; IndexNow accepts up to ~10k URLs)
npm run seo:indexnow
```

Expected: HTTP **200** or **202**.  
If **422**: key file not reachable yet — wait for Vercel deploy, hard-refresh the `.txt` URL, retry.

## 3. Google Search Console (one-time, browser)

1. https://search.google.com/search-console → Add property **URL prefix** `https://evorios.com`
2. Verify (HTML tag, DNS, or file upload — any one method)
3. Sitemaps → submit `https://evorios.com/sitemap.xml`
4. URL Inspection → request indexing for `/`, `/ru/`, `/de/`, `/es/` (priority pages)

Google has **no free bulk “index everything now” API** without Search Console API OAuth; sitemap + Inspection is the normal path.

## 4. Bing Webmaster (one-time, browser)

1. https://www.bing.com/webmasters → Add `https://evorios.com`
2. Import from Google (optional) or verify via XML/DNS
3. Sitemaps → submit `https://evorios.com/sitemap.xml`
4. IndexNow is already wired via step 2 (Bing consumes IndexNow)

## 5. After each marketing content deploy

```bash
npm run seo:sitemap          # if locales/rent URLs changed
# copy sitemap to Web + deploy
npm run seo:indexnow -- --limit=50   # or full
```

## What this does / doesn’t do

| Does | Doesn’t |
|---|---|
| Lists all locale landings in sitemap | Guarantee ChatGPT finds you tomorrow |
| Notifies Bing/Yandex via IndexNow | Replace backlinks / brand mentions |
| Gives GSC/Bing a clean URL list | Override Évora (Portugal) brand confusion overnight |

Brand queries still need **mentions + links** (`Evorios` app / Product Hunt / social) so “Evorios” doesn’t lose to city Évora.
