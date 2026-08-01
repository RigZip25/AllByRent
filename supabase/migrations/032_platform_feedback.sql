-- Platform help / complaint / feedback inbox (ops console + in-app form)

create table if not exists public.platform_feedback (
  id uuid primary key,
  kind text not null default 'help'
    check (kind in ('help', 'complaint', 'idea', 'other')),
  message text not null default '',
  contact_email text not null default '',
  screen_hint text not null default '',
  user_id uuid references auth.users (id) on delete set null,
  user_email text not null default '',
  status text not null default 'new'
    check (status in ('new', 'seen', 'done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists platform_feedback_created_at_idx
  on public.platform_feedback (created_at desc);
create index if not exists platform_feedback_status_idx
  on public.platform_feedback (status);

alter table public.platform_feedback enable row level security;

-- Anyone (incl. anon) can submit feedback from the app.
drop policy if exists "platform_feedback_insert_all" on public.platform_feedback;
create policy "platform_feedback_insert_all"
  on public.platform_feedback for insert
  with check (char_length(message) > 0 and char_length(message) <= 4000);

-- Reads go through service-role API (ops console), not public select.
drop policy if exists "platform_feedback_select_none" on public.platform_feedback;
-- no select policy for anon/authenticated → only service role reads
