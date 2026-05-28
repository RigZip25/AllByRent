-- Co-hosts: account-level helpers for a primary host (v1 — all listings on host account).
-- App persists invites in localStorage when offline; sync can be added via service role later.

create table if not exists public.co_hosts (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references auth.users (id) on delete cascade,
  co_host_email text not null,
  co_host_user_id uuid references auth.users (id) on delete set null,
  status text not null check (status in ('pending', 'active')),
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  unique (host_id, co_host_email)
);

create index if not exists co_hosts_host_id_idx on public.co_hosts (host_id);
create index if not exists co_hosts_co_host_email_idx on public.co_hosts (lower(co_host_email));

alter table public.co_hosts enable row level security;

drop policy if exists "co_hosts_select_host" on public.co_hosts;
create policy "co_hosts_select_host"
  on public.co_hosts for select
  using (auth.uid() = host_id or auth.uid() = co_host_user_id);

drop policy if exists "co_hosts_insert_host" on public.co_hosts;
create policy "co_hosts_insert_host"
  on public.co_hosts for insert
  with check (auth.uid() = host_id);

drop policy if exists "co_hosts_update_host" on public.co_hosts;
create policy "co_hosts_update_host"
  on public.co_hosts for update
  using (auth.uid() = host_id or auth.uid() = co_host_user_id)
  with check (auth.uid() = host_id or auth.uid() = co_host_user_id);

drop policy if exists "co_hosts_delete_host" on public.co_hosts;
create policy "co_hosts_delete_host"
  on public.co_hosts for delete
  using (auth.uid() = host_id);
