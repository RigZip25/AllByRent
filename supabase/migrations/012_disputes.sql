-- Disputes table + RLS policies

create table if not exists public.disputes (
  id uuid primary key,
  rental_id uuid not null references public.rentals (id) on delete cascade,
  opened_by uuid not null references auth.users (id) on delete cascade,
  status text not null default 'open',
  deposit_frozen boolean not null default true,
  evidence_deadline timestamptz not null,
  renter_evidence jsonb not null default '[]'::jsonb,
  owner_evidence jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists disputes_unique_rental on public.disputes (rental_id);
create index if not exists disputes_status_idx on public.disputes (status);

alter table public.disputes enable row level security;

-- Participants (owner or renter) can read disputes for their rentals.
drop policy if exists "disputes_select_participants" on public.disputes;
create policy "disputes_select_participants"
  on public.disputes for select
  using (
    exists (
      select 1 from public.rentals r
      where r.id = disputes.rental_id
        and (r.owner_id = auth.uid() or r.renter_id = auth.uid())
    )
  );

-- Participants can insert a dispute for their rental.
drop policy if exists "disputes_insert_participants" on public.disputes;
create policy "disputes_insert_participants"
  on public.disputes for insert
  with check (
    exists (
      select 1 from public.rentals r
      where r.id = disputes.rental_id
        and (r.owner_id = auth.uid() or r.renter_id = auth.uid())
    )
  );

-- Participants can update dispute evidence while open.
drop policy if exists "disputes_update_participants" on public.disputes;
create policy "disputes_update_participants"
  on public.disputes for update
  using (
    exists (
      select 1 from public.rentals r
      where r.id = disputes.rental_id
        and (r.owner_id = auth.uid() or r.renter_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.rentals r
      where r.id = disputes.rental_id
        and (r.owner_id = auth.uid() or r.renter_id = auth.uid())
    )
  );

create or replace function public.set_disputes_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists disputes_updated_at on public.disputes;
create trigger disputes_updated_at
  before update on public.disputes
  for each row execute function public.set_disputes_updated_at();

