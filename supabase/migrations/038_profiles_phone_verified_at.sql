-- Phone KYC: timestamp when SMS OTP succeeded (boolean phone_verified stays in sync).

alter table public.profiles
  add column if not exists phone_verified_at timestamptz;

-- Backfill from existing boolean badge.
update public.profiles
set phone_verified_at = coalesce(phone_verified_at, updated_at, created_at, now())
where phone_verified is true
  and phone_verified_at is null;

create index if not exists profiles_phone_verified_at_idx
  on public.profiles (phone_verified_at)
  where phone_verified_at is not null;

-- When phone number changes, clear verification (clients + server).
-- Only service_role may set phone_verified / phone_verified_at to a verified state.
create or replace function public.profiles_protect_phone_verified()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' then
    if new.phone is distinct from old.phone then
      new.phone_verified := false;
      new.phone_verified_at := null;
    end if;

    if (
      (new.phone_verified is true and coalesce(old.phone_verified, false) is not true)
      or (new.phone_verified_at is not null and old.phone_verified_at is distinct from new.phone_verified_at)
    ) and coalesce(auth.role(), '') <> 'service_role' then
      new.phone_verified := coalesce(old.phone_verified, false);
      new.phone_verified_at := old.phone_verified_at;
    end if;

    if new.phone_verified is true and new.phone_verified_at is null and coalesce(auth.role(), '') = 'service_role' then
      new.phone_verified_at := now();
    end if;

    if new.phone_verified is not true then
      new.phone_verified_at := null;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_phone_verified on public.profiles;
create trigger profiles_protect_phone_verified
  before update on public.profiles
  for each row execute function public.profiles_protect_phone_verified();
