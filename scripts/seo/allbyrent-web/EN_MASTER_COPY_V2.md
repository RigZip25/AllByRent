# English master copy v2 (editorial pass)

Goal: bring EN homepage copy to ~9/10 on clarity, nativeness, brand voice, and fitness as translation master.

## What changed (editorial)

- Removed **business cell** → **Every home can open a shop on the block**
- H1: **Your home is already a business.** (keeps highlight span)
- Fixed grammar: *A few steps turn…*
- Meta: dropped *idle stuff*; clearer trust line
- Removed US-only **Nextdoor** → Facebook
- Softened legal-ese *legal evidence* → *clear record* (still serious, less courtroom)
- Slightly less manifesto / less repetitive “3 minutes”
- CTA labels: Rent it out / Sell it / Give it away (clearer than Daily income / Give freely)
- *strangers* → *neighbors* in trust headline

Kept brand line: **Evorios — The evolution of ownership**

## How to apply (AllByRent-Web)

```bash
# from AllByRent-Web repo root, with this file present OR copied from AllByRent:
python3 apply-en-master-copy-v2.py index.html
git add index.html
git commit -m "Editorial EN master copy v2 (nativeness pass)"
git push
```

Or in Cursor agent on AllByRent-Web: run the script / apply `en-master-copy-v2.json` replacements to `index.html` only, then commit + push.

## After EN ships

Re-translate / re-edit locales from this EN master (especially the old *business cell* line and H1). Do not blindly machine-refresh whole pages without editorial pass.
