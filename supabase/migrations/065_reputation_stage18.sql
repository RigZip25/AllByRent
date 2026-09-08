-- Stage 18 reputation (V2, V4, V6, V9, V11 hardening).
-- V3 / V5 / V11 account-side already closed in 046–047 / 063–064.

-- ---------------------------------------------------------------------------
-- V2: rating + reviews_count maintained from revealed reviews
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists reviews_count integer not null default 0;

alter table public.profiles
  add column if not exists damage_dispute_count integer not null default 0;

-- Trust fields the client must not write (extends R12 / V5).
create or replace function public.profiles_protect_trust_fields()
returns trigger
language plpgsql
as $$
begin
  if public.is_trusted_writer() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.identity_verified := false;
    new.stripe_payouts_enabled := false;
    new.rating := null;
    new.reviews_count := 0;
    new.damage_dispute_count := 0;
  else
    new.identity_verified := coalesce(old.identity_verified, false);
    new.stripe_payouts_enabled := coalesce(old.stripe_payouts_enabled, false);
    new.rating := old.rating;
    new.reviews_count := coalesce(old.reviews_count, 0);
    new.damage_dispute_count := coalesce(old.damage_dispute_count, 0);
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- V6: reveal when both sides submit OR the oldest review is ≥ 14 days old
-- ---------------------------------------------------------------------------
create or replace function public.review_pair_revealed(p_rental_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    case
      when p_rental_id is null then false
      when (
        select count(*)::integer from public.reviews where rental_id = p_rental_id
      ) >= 2 then true
      when exists (
        select 1
        from public.reviews r
        where r.rental_id = p_rental_id
          and r.created_at <= now() - interval '14 days'
      ) then true
      else false
    end;
$$;

revoke all on function public.review_pair_revealed(uuid) from public;
grant execute on function public.review_pair_revealed(uuid) to anon, authenticated, service_role;

create or replace function public.recalc_profile_rating(p_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_avg numeric;
  v_count integer;
  v_damage integer;
  v_effective numeric;
begin
  if p_user is null then
    return;
  end if;

  select
    avg(r.rating)::numeric,
    count(*)::integer
  into v_avg, v_count
  from public.reviews r
  where r.reviewee_id = p_user
    and public.review_pair_revealed(r.rental_id);

  select coalesce(p.damage_dispute_count, 0)
  into v_damage
  from public.profiles p
  where p.id = p_user;

  if v_count is null or v_count = 0 then
    v_effective := null;
    v_count := 0;
  else
    v_effective := greatest(1.0, round(v_avg - (0.3 * coalesce(v_damage, 0)), 1));
  end if;

  update public.profiles
  set
    rating = v_effective,
    reviews_count = v_count
  where id = p_user;
end;
$$;

revoke all on function public.recalc_profile_rating(uuid) from public;
grant execute on function public.recalc_profile_rating(uuid) to service_role;

create or replace function public.reviews_after_change_recalc()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.recalc_profile_rating(new.reviewee_id);
    return new;
  elsif tg_op = 'DELETE' then
    perform public.recalc_profile_rating(old.reviewee_id);
    return old;
  else
    if old.reviewee_id is distinct from new.reviewee_id then
      perform public.recalc_profile_rating(old.reviewee_id);
    end if;
    perform public.recalc_profile_rating(new.reviewee_id);
    return new;
  end if;
end;
$$;

drop trigger if exists reviews_recalc_rating on public.reviews;
create trigger reviews_recalc_rating
  after insert or delete or update of rating, reviewee_id, rental_id
  on public.reviews
  for each row execute function public.reviews_after_change_recalc();

-- ---------------------------------------------------------------------------
-- V4: rating 1–5; completed rental only; not self (already); participants
-- V9: open dispute blocks a five-star review
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'reviews_rating_range'
  ) then
    alter table public.reviews
      add constraint reviews_rating_range check (rating between 1 and 5);
  end if;
end $$;

drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own"
  on public.reviews for insert
  with check (
    reviewer_id = auth.uid()
    and reviewee_id is distinct from auth.uid()
    and rating between 1 and 5
    and exists (
      select 1
      from public.rentals r
      where r.id = reviews.rental_id
        and r.status = 'completed'
        and (r.owner_id = auth.uid() or r.renter_id = auth.uid())
        and (r.owner_id = reviews.reviewee_id or r.renter_id = reviews.reviewee_id)
    )
    and (
      rating < 5
      or not exists (
        select 1
        from public.disputes d
        where d.rental_id = reviews.rental_id
          and d.status in ('open', 'under_review')
      )
    )
  );

-- ---------------------------------------------------------------------------
-- V9: damage dispute outcomes leave a reputation scar (trusted writer path)
-- ---------------------------------------------------------------------------
create or replace function public.disputes_apply_damage_reputation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
  v_renter uuid;
begin
  if tg_op <> 'UPDATE' then
    return new;
  end if;
  if new.status is not distinct from old.status then
    return new;
  end if;
  if new.status <> 'resolved' then
    return new;
  end if;
  if coalesce(new.reason_code, '') <> 'damage' then
    return new;
  end if;
  if coalesce(new.resolution_outcome, '') not in ('favor_host', 'favor_renter', 'split') then
    return new;
  end if;

  select r.owner_id, r.renter_id into v_owner, v_renter
  from public.rentals r
  where r.id = new.rental_id;

  if new.resolution_outcome = 'favor_host' and v_renter is not null then
    update public.profiles
    set damage_dispute_count = coalesce(damage_dispute_count, 0) + 1
    where id = v_renter;
    perform public.recalc_profile_rating(v_renter);
  elsif new.resolution_outcome = 'favor_renter' and v_owner is not null then
    update public.profiles
    set damage_dispute_count = coalesce(damage_dispute_count, 0) + 1
    where id = v_owner;
    perform public.recalc_profile_rating(v_owner);
  elsif new.resolution_outcome = 'split' then
    if v_renter is not null then
      update public.profiles
      set damage_dispute_count = coalesce(damage_dispute_count, 0) + 1
      where id = v_renter;
      perform public.recalc_profile_rating(v_renter);
    end if;
    if v_owner is not null then
      update public.profiles
      set damage_dispute_count = coalesce(damage_dispute_count, 0) + 1
      where id = v_owner;
      perform public.recalc_profile_rating(v_owner);
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists disputes_apply_damage_reputation on public.disputes;
create trigger disputes_apply_damage_reputation
  after update of status, reason_code, resolution_outcome
  on public.disputes
  for each row execute function public.disputes_apply_damage_reputation();

-- ---------------------------------------------------------------------------
-- V11 hardening: keep review text if the rental row is removed
-- ---------------------------------------------------------------------------
alter table public.reviews alter column rental_id drop not null;

do $$
declare
  c_name text;
begin
  select tc.constraint_name into c_name
  from information_schema.table_constraints tc
  join information_schema.key_column_usage kcu
    on tc.constraint_name = kcu.constraint_name
   and tc.table_schema = kcu.table_schema
  where tc.table_schema = 'public'
    and tc.table_name = 'reviews'
    and tc.constraint_type = 'FOREIGN KEY'
    and kcu.column_name = 'rental_id'
  limit 1;

  if c_name is not null then
    execute format('alter table public.reviews drop constraint %I', c_name);
  end if;
end $$;

alter table public.reviews
  add constraint reviews_rental_id_fkey
  foreign key (rental_id) references public.rentals (id) on delete set null;

-- ---------------------------------------------------------------------------
-- public_profiles: expose reviews_count
-- ---------------------------------------------------------------------------
create or replace view public.public_profiles as
select
  id,
  display_name,
  rating,
  reviews_count,
  identity_verified,
  phone_verified,
  created_at,
  avatar_path
from public.profiles;

alter view public.public_profiles set (security_invoker = false);
grant select on public.public_profiles to anon, authenticated, service_role;

-- One-shot backfill after reveal rule + count column land.
do $$
declare
  r record;
begin
  for r in select id from public.profiles loop
    perform public.recalc_profile_rating(r.id);
  end loop;
end $$;
