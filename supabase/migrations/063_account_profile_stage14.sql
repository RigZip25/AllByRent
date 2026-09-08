-- Stage 14: account deletion keeps counterparty history, co-host accept is
-- invitee-only, revealed reviews are public, avatars leave the device.

-- ─── P1a: tombstones instead of cascading away shared rentals ───────────────
-- Deleting auth.users used to wipe rentals (and thus reviews / messages /
-- disputes) for both sides. Party FKs become nullable and SET NULL so the
-- remaining party keeps the booking, invoices, and dispute trail. Listings
-- keep their rows as drafts with a null owner rather than vanishing under
-- open history that still points at them.

alter table public.rentals drop constraint if exists rentals_owner_id_fkey;
alter table public.rentals drop constraint if exists rentals_renter_id_fkey;
alter table public.rentals alter column owner_id drop not null;
alter table public.rentals alter column renter_id drop not null;
alter table public.rentals
  add constraint rentals_owner_id_fkey
  foreign key (owner_id) references auth.users (id) on delete set null;
alter table public.rentals
  add constraint rentals_renter_id_fkey
  foreign key (renter_id) references auth.users (id) on delete set null;

alter table public.listings drop constraint if exists listings_owner_id_fkey;
alter table public.listings alter column owner_id drop not null;
alter table public.listings
  add constraint listings_owner_id_fkey
  foreign key (owner_id) references auth.users (id) on delete set null;

alter table public.reviews drop constraint if exists reviews_reviewer_id_fkey;
alter table public.reviews drop constraint if exists reviews_reviewee_id_fkey;
alter table public.reviews alter column reviewer_id drop not null;
alter table public.reviews alter column reviewee_id drop not null;
alter table public.reviews
  add constraint reviews_reviewer_id_fkey
  foreign key (reviewer_id) references auth.users (id) on delete set null;
alter table public.reviews
  add constraint reviews_reviewee_id_fkey
  foreign key (reviewee_id) references auth.users (id) on delete set null;

alter table public.messages drop constraint if exists messages_sender_id_fkey;
alter table public.messages drop constraint if exists messages_recipient_id_fkey;
alter table public.messages alter column sender_id drop not null;
alter table public.messages alter column recipient_id drop not null;
alter table public.messages
  add constraint messages_sender_id_fkey
  foreign key (sender_id) references auth.users (id) on delete set null;
alter table public.messages
  add constraint messages_recipient_id_fkey
  foreign key (recipient_id) references auth.users (id) on delete set null;

alter table public.disputes drop constraint if exists disputes_opened_by_fkey;
alter table public.disputes alter column opened_by drop not null;
alter table public.disputes
  add constraint disputes_opened_by_fkey
  foreign key (opened_by) references auth.users (id) on delete set null;

-- ─── P5a / P6a: invitee accepts; host cannot Mark active alone ──────────────

drop policy if exists "co_hosts_accept_invitee" on public.co_hosts;
create policy "co_hosts_accept_invitee"
  on public.co_hosts for update
  using (
    status = 'pending'
    and lower(co_host_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
  with check (
    status = 'active'
    and co_host_user_id = auth.uid()
    and lower(co_host_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

create or replace function public.co_hosts_guard_accept()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE'
     and new.status = 'active'
     and old.status is distinct from 'active' then
    if new.co_host_user_id is null then
      raise exception
        'A co-host invite can only become active when the invitee is bound.'
        using errcode = 'P0001';
    end if;
    if coalesce(auth.role(), '') <> 'service_role'
       and auth.uid() is distinct from new.co_host_user_id then
      raise exception
        'Only the invited person can accept a co-host invite.'
        using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists co_hosts_guard_accept on public.co_hosts;
create trigger co_hosts_guard_accept
  before update on public.co_hosts
  for each row execute function public.co_hosts_guard_accept();

-- ─── P7a: permission bit enforced in RLS (v1 default = full listing manage) ─

alter table public.co_hosts
  add column if not exists can_manage_listings boolean not null default true;

create or replace function public.is_active_co_host_of(target_host_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.co_hosts
    where host_id = target_host_id
      and status = 'active'
      and co_host_user_id = auth.uid()
      and can_manage_listings = true
  );
$$;

revoke all on function public.is_active_co_host_of(uuid) from public;
grant execute on function public.is_active_co_host_of(uuid) to authenticated;

-- ─── P9a: revealed reviews readable by anyone (blind until both sides) ──────
-- Count via SECURITY DEFINER so the policy does not re-enter RLS on reviews
-- (plain `select count(*) from reviews` recurses infinitely).

create or replace function public.review_pair_revealed(p_rental_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select (
    select count(*)::integer from public.reviews where rental_id = p_rental_id
  ) >= 2;
$$;

revoke all on function public.review_pair_revealed(uuid) from public;
grant execute on function public.review_pair_revealed(uuid) to anon, authenticated, service_role;

drop policy if exists "reviews_select_public_after_reveal" on public.reviews;
create policy "reviews_select_public_after_reveal"
  on public.reviews for select
  using (
    reviewee_id is not null
    and public.review_pair_revealed(rental_id)
  );

-- Same recursion trap on the original blind-review policy (011).
drop policy if exists "reviews_select_after_both_submitted" on public.reviews;
create policy "reviews_select_after_both_submitted"
  on public.reviews for select
  using (
    reviewee_id = auth.uid()
    and public.review_pair_revealed(rental_id)
  );

-- ─── P11a: public avatars leave the owner's device ──────────────────────────

alter table public.profiles
  add column if not exists avatar_path text;

create or replace view public.public_profiles as
select
  id,
  display_name,
  rating,
  identity_verified,
  phone_verified,
  created_at,
  avatar_path
from public.profiles;

alter view public.public_profiles set (security_invoker = false);

grant select on public.public_profiles to anon, authenticated, service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "avatars_owner_insert" on storage.objects;
create policy "avatars_owner_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );

drop policy if exists "avatars_owner_update" on storage.objects;
create policy "avatars_owner_update"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  )
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );

drop policy if exists "avatars_owner_delete" on storage.objects;
create policy "avatars_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );
