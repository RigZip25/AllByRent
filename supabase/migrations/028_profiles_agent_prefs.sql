-- Agent prefs for Mr. Evorios nudges (timezone + quiet hours + notification prefs sync)

alter table public.profiles
  add column if not exists timezone text,
  add column if not exists agent_prefs jsonb not null default '{}'::jsonb;

comment on column public.profiles.timezone is 'IANA timezone for quiet-hours (e.g. America/Chicago)';
comment on column public.profiles.agent_prefs is 'Synced client prefs: quietHoursStart/End, agentTips, pushEnabled, nudge counters helpers';
