# Agent brief — AllByRent-Web: deploy sitemap + IndexNow key

**Repo:** `AllByRent-Web` (marketing — `evorios.com`)  
**Goal:** Make locale landings discoverable + enable Bing IndexNow.

## Files to update/add at Web repo root

Copy from AllByRent (`RigZip25/AllByRent`) after `npm run seo:sitemap`:

1. **Replace** root `sitemap.xml` with contents of  
   `scripts/seo/allbyrent-web/sitemap.xml`  
   (must include `/cs/`, `/sk/`, `/pl/`, `/de/`, `/fr/`, `/it/`, `/pt/`, `/pt-pt/`, `/es/`, `/es-mx/`, `/es-cl/`, `/es-ar/`, `/es-co/`, `/ru/`, `/uk/`).

2. **Add** new file at Web root:  
   `cc7fe5b481b3f86045692de807516ca6.txt`  
   with exact single-line content:  
   `cc7fe5b481b3f86045692de807516ca6`  
   (no HTML, no quotes).

3. Keep `robots.txt` pointing at `Sitemap: https://evorios.com/sitemap.xml`.

## Do not
- Change locale HTML copy in this task.
- Block crawlers.
- Put the IndexNow key only under a subfolder — it must be at domain root.

## Done when
- Commit + push + Vercel deploy.
- https://evorios.com/sitemap.xml contains locale folder URLs.
- https://evorios.com/cc7fe5b481b3f86045692de807516ca6.txt returns the key string (200, `text/plain`).

Commit message:  
`SEO: locale URLs in sitemap + IndexNow key`

Then tell the AllByRent agent to run `npm run seo:indexnow`.
