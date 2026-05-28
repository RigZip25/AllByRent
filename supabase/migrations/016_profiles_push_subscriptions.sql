-- Web Push subscriptions stored on profiles

alter table public.profiles
  add column if not exists push_subscriptions jsonb not null default '[]'::jsonb;

