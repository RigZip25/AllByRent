-- Notifications table + RLS policies

create table if not exists public.notifications (
  id uuid primary key,
  recipient_id uuid not null references auth.users (id) on delete cascade,
  actor_id uuid references auth.users (id) on delete set null,
  type text not null default 'general',
  title text not null default '',
  body text not null default '',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_recipient_id_idx on public.notifications (recipient_id);
create index if not exists notifications_read_at_idx on public.notifications (read_at);
create index if not exists notifications_created_at_idx on public.notifications (created_at);

alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
  on public.notifications for select
  using (recipient_id = auth.uid());

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
  on public.notifications for update
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

-- Inserts are allowed by any signed-in user (e.g. renter creates a host notification),
-- but must target a valid recipient. This keeps the app simple while still preventing reads.
drop policy if exists "notifications_insert_any" on public.notifications;
create policy "notifications_insert_any"
  on public.notifications for insert
  with check (auth.uid() is not null);

