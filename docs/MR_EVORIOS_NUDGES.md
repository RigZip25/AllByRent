# Mr. Evorios — abandoned listing nudges

**Status:** shipped in code (cron + draft autosave). Requires migration **028** + Vercel cron.

## Behavior

1. While listing a host, the wizard **autosaves drafts** (local + Supabase when signed in) with `wizard_step`.
2. Hourly cron `/api/cron/abandoned-listing-nudge`:
   - Finds `listing_status = 'draft'` idle **> 2 hours**
   - Skips **quiet hours** (default **21:00–08:00** in the user’s timezone, default `America/Chicago`)
   - Respects `agentTips` / `pushEnabled` synced to `profiles.agent_prefs`
   - Sends up to **3** pushes, ≥ **12 hours** apart
   - Copy via Gemini when configured, else Mr. E templates
   - Deep link: `/?screen=listItem&listingId=…&skipSplash=1`
3. In-app: Garage tab shows a **Resume draft** card after ~30 minutes idle.

## Operator

1. Run `supabase/migrations/028_profiles_agent_prefs.sql` in SQL Editor.
2. Confirm Vercel has `CRON_SECRET`, VAPID keys, `GEMINI_API_KEY` (optional for copy).
3. Enable push in the app; keep **Tips from Mr. Evorios** on.

## Not yet (later)

- Invisible monitoring of *all* flows (booking, co-host, etc.)
- User-editable quiet hours UI
- SMS / email channel
