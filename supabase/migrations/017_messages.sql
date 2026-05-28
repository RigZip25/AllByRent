-- Messages table for owner-renter chat + RLS

create table if not exists public.messages (
  id uuid primary key,
  rental_id uuid not null references public.rentals (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  recipient_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_rental_id_idx on public.messages (rental_id);
create index if not exists messages_sender_id_idx on public.messages (sender_id);
create index if not exists messages_recipient_id_idx on public.messages (recipient_id);
create index if not exists messages_created_at_idx on public.messages (created_at);

alter table public.messages enable row level security;

drop policy if exists "messages_select_participants" on public.messages;
create policy "messages_select_participants"
  on public.messages for select
  using (sender_id = auth.uid() or recipient_id = auth.uid());

drop policy if exists "messages_insert_sender" on public.messages;
create policy "messages_insert_sender"
  on public.messages for insert
  with check (sender_id = auth.uid());

-- Enable realtime replication (required for Supabase Realtime Postgres Changes).
alter publication supabase_realtime add table public.messages;

