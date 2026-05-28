-- Profile trust badges + light stats

alter table public.profiles
  add column if not exists phone_verified boolean not null default false;

alter table public.profiles
  add column if not exists identity_verified boolean not null default false;

alter table public.profiles
  add column if not exists rating numeric;

