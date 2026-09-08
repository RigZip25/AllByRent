-- Nobody could read anybody's name.
--
-- `profiles` has one select policy, `auth.uid() = id` (migration 001), and the
-- app reads that table for other people all over: the host on a listing, the
-- neighbour behind a garage, the other side of a rental, the trust badges on a
-- public profile. Every one of those reads came back empty, so the interface
-- filled the gap with placeholders — "Neighbor", "Host", "Renter", 0.0 stars —
-- and a tapped profile said "not found" for a person who plainly exists.
--
-- Widening the policy is not the answer: row level security is per row, so a
-- policy that let a counterparty read the row would hand them the e-mail, the
-- phone number, the date of birth and the Stripe ids sitting in the same
-- columns. A view is per column, and a view runs with its owner's rights, so
-- `public_profiles` publishes exactly the fields a stranger is meant to see.

create or replace view public.public_profiles as
select
  id,
  display_name,
  rating,
  identity_verified,
  phone_verified,
  created_at
from public.profiles;

-- Read as the view's owner, not the caller: that is the point of the view, and
-- saying it here keeps a future Postgres default from quietly reversing it.
alter view public.public_profiles set (security_invoker = false);

-- Names and badges are shown on listings a guest can browse, so anonymous
-- readers get the same projection. Nothing here is writable.
grant select on public.public_profiles to anon, authenticated, service_role;

comment on view public.public_profiles is
  'Name, rating and trust badges only. The one projection of profiles that is '
  'readable by other people; everything else on profiles stays behind RLS.';
