# Phone KYC / SMS verify (Wave 2)

## What it does
- Profile → Personal info → Phone: enter number, send SMS OTP, verify, show verified badge.
- Soft gates (app otherwise usable):
  - Stripe Connect / payouts onboarding requires verified phone.
  - Go public for **paid** listings (rent / sell / rent-to-own) requires verified phone.
  - Gift-only listings can publish without phone verify.
- Server marks `profiles.phone_verified` + `profiles.phone_verified_at` via service role after OTP.

## Provider
Uses **Supabase Auth phone OTP** (`updateUser` → `verifyOtp` type `phone_change`).
Configure Twilio or MessageBird under Supabase → Authentication → Providers → Phone.
No Twilio keys are stored in this app’s env — they live in the Supabase Dashboard.

## Env (Vercel + `.env.local`)

Both flags default to **OFF** in code. Leave them false until SMS provider is configured.


Both flags default to **OFF** in code. Leave them false until SMS provider is configured.


Both flags default to **OFF** in code. Leave them false until SMS provider is configured.


Both flags default to **OFF** in code. Leave them false until SMS provider is configured.


Both flags default to **OFF** in code. Leave them false until SMS provider is configured.


Both flags default to **OFF** in code. Leave them false until SMS provider is configured.


Both flags default to **OFF** in code. Leave them false until SMS provider is configured.


Both flags default to **OFF** in code. Leave them false until SMS provider is configured.


Both flags default to **OFF** in code. Leave them false until SMS provider is configured.


Both flags default to **OFF** in code. Leave them false until SMS provider is configured.


Both flags default to **OFF** in code. Leave them false until SMS provider is configured.

```
PHONE_OTP_ENABLED=false
VITE_PHONE_OTP_ENABLED=false
# Flip both to true only after Supabase Phone + Twilio/MessageBird are ready
VITE_SUPABASE_URL=…
VITE_SUPABASE_ANON_KEY=…
SUPABASE_SERVICE_ROLE_KEY=…
```

## SQL
Run `supabase/migrations/038_profiles_phone_verified_at.sql` in the Supabase SQL editor (see file contents).

## API
- `POST /api/auth/phone_otp_send` `{ phone }` + Bearer
- `POST /api/auth/phone_otp_verify` `{ phone, token }` + Bearer
