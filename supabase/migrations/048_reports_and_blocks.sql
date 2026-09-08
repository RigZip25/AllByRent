-- Reporting content and blocking people.
--
-- The app carries peer chat and user photos but had neither, which is grounds
-- for rejection under Apple 1.2 and the Google Play UGC policy. Reports land in
-- an ops queue; blocks are enforced by the client on every surface that shows
-- someone else's content, and here so a blocked person cannot write to you.

-- The state guard below calls the helper from 047. If that migration was
-- skipped, the trigger installs cleanly and then fails on every update, so say
-- so here instead.
do $$
begin
  if to_regprocedure('public.is_trusted_writer()') is null then
    raise exception 'apply 047_trusted_writer_guards.sql first: public.is_trusted_writer() is missing';
  end if;
end $$;

create table if not exists public.content_reports (
  id uuid primary key,
  -- What is being reported. `message` carries the thread key so the moderator
  -- can find the conversation without a full-text search.
  target_kind text not null
    check (target_kind in ('listing', 'message', 'profile', 'request')),
  target_id text not null default '',
  target_thread_key text not null default '',
  -- Who the report is about. Kept even when the target row is later deleted.
  reported_user_id uuid references auth.users (id) on delete set null,
  reporter_id uuid references auth.users (id) on delete set null,
  reason text not null
    check (reason in (
      'harassment',
      'scam',
      'off_platform',
      'sexual',
      'hate',
      'violence',
      'illegal_item',
      'not_as_described',
      'spam',
      'other'
    )),
  details text not null default '',
  -- A copy of the reported text, because the author can delete it afterwards.
  evidence text not null default '',
  status text not null default 'new'
    check (status in ('new', 'reviewing', 'actioned', 'dismissed')),
  moderator_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists content_reports_created_at_idx
  on public.content_reports (created_at desc);
create index if not exists content_reports_status_idx
  on public.content_reports (status);
create index if not exists content_reports_reported_user_idx
  on public.content_reports (reported_user_id);

alter table public.content_reports enable row level security;

-- A signed-in user files their own report and cannot report themselves.
drop policy if exists "content_reports_insert_own" on public.content_reports;
create policy "content_reports_insert_own"
  on public.content_reports for insert
  with check (
    reporter_id = auth.uid()
    and (reported_user_id is null or reported_user_id <> auth.uid())
    and char_length(details) <= 4000
    and char_length(evidence) <= 4000
  );

-- The reporter may see the state of their own reports; everything else is read
-- through the service-role ops route.
drop policy if exists "content_reports_select_own" on public.content_reports;
create policy "content_reports_select_own"
  on public.content_reports for select
  using (reporter_id = auth.uid());

-- Only moderators change a report's state.
create or replace function public.content_reports_guard_state()
returns trigger
language plpgsql
as $$
begin
  if public.is_trusted_writer() then
    return new;
  end if;

  new.status := old.status;
  new.moderator_note := old.moderator_note;
  return new;
end;
$$;

drop trigger if exists content_reports_guard_state on public.content_reports;
create trigger content_reports_guard_state
  before update on public.content_reports
  for each row execute function public.content_reports_guard_state();

create table if not exists public.user_blocks (
  blocker_id uuid not null references auth.users (id) on delete cascade,
  blocked_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint user_blocks_not_self check (blocker_id <> blocked_id)
);

create index if not exists user_blocks_blocked_id_idx
  on public.user_blocks (blocked_id);

alter table public.user_blocks enable row level security;

-- You manage your own block list and only see your own.
drop policy if exists "user_blocks_select_own" on public.user_blocks;
create policy "user_blocks_select_own"
  on public.user_blocks for select
  using (blocker_id = auth.uid());

drop policy if exists "user_blocks_insert_own" on public.user_blocks;
create policy "user_blocks_insert_own"
  on public.user_blocks for insert
  with check (blocker_id = auth.uid());

drop policy if exists "user_blocks_delete_own" on public.user_blocks;
create policy "user_blocks_delete_own"
  on public.user_blocks for delete
  using (blocker_id = auth.uid());

/**
 * Hiding content is the client's job, but a message must not arrive at all:
 * the block has to hold even if the sender calls the API directly.
 */
create or replace function public.messages_reject_blocked()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1 from public.user_blocks b
    where (b.blocker_id = new.recipient_id and b.blocked_id = new.sender_id)
       or (b.blocker_id = new.sender_id and b.blocked_id = new.recipient_id)
  ) then
    raise exception 'This conversation is blocked';
  end if;
  return new;
end;
$$;

drop trigger if exists messages_reject_blocked on public.messages;
create trigger messages_reject_blocked
  before insert on public.messages
  for each row execute function public.messages_reject_blocked();
