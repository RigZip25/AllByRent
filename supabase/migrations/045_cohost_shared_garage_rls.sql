-- Shared household garage: active co-hosts can stock / edit the primary host’s
-- listings, storefront, and listing-photos folder (path prefix = owner_id).
-- Concurrent helpers (Barbara / John / Peter / Joanna) stamp the same owner_id;
-- each listing keeps its own UUID so creates do not conflict.

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
  );
$$;

revoke all on function public.is_active_co_host_of(uuid) from public;
grant execute on function public.is_active_co_host_of(uuid) to authenticated;

-- Invitee can read pending invites addressed to their email (before accept binds user id).
drop policy if exists "co_hosts_select_invitee_email" on public.co_hosts;
create policy "co_hosts_select_invitee_email"
  on public.co_hosts for select
  using (
    status = 'pending'
    and lower(co_host_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

-- Listings: owner or active co-host of owner.
drop policy if exists "listings_select_active_or_owner" on public.listings;
create policy "listings_select_active_or_owner"
  on public.listings for select
  using (
    listing_status = 'active'
    or owner_id = auth.uid()
    or public.is_active_co_host_of(owner_id)
  );

drop policy if exists "listings_insert_own" on public.listings;
create policy "listings_insert_own"
  on public.listings for insert
  with check (
    owner_id = auth.uid()
    or public.is_active_co_host_of(owner_id)
  );

drop policy if exists "listings_update_own" on public.listings;
create policy "listings_update_own"
  on public.listings for update
  using (
    owner_id = auth.uid()
    or public.is_active_co_host_of(owner_id)
  )
  with check (
    owner_id = auth.uid()
    or public.is_active_co_host_of(owner_id)
  );

drop policy if exists "listings_delete_own" on public.listings;
create policy "listings_delete_own"
  on public.listings for delete
  using (
    owner_id = auth.uid()
    or public.is_active_co_host_of(owner_id)
  );

-- Storefront Live / look: primary or active co-host.
drop policy if exists garage_storefronts_host_write on public.garage_storefronts;
create policy garage_storefronts_host_write
  on public.garage_storefronts for all
  using (
    auth.uid() = host_id
    or public.is_active_co_host_of(host_id)
  )
  with check (
    auth.uid() = host_id
    or public.is_active_co_host_of(host_id)
  );

-- Photos live under {owner_id}/{listing_id}/… — allow co-hosts of that owner_id.
drop policy if exists "listing_photos_owner_insert" on storage.objects;
create policy "listing_photos_owner_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-photos'
    and (
      auth.uid()::text = (string_to_array(name, '/'))[1]
      or public.is_active_co_host_of(((string_to_array(name, '/'))[1])::uuid)
    )
  );

drop policy if exists "listing_photos_owner_update" on storage.objects;
create policy "listing_photos_owner_update"
  on storage.objects for update
  using (
    bucket_id = 'listing-photos'
    and (
      auth.uid()::text = (string_to_array(name, '/'))[1]
      or public.is_active_co_host_of(((string_to_array(name, '/'))[1])::uuid)
    )
  )
  with check (
    bucket_id = 'listing-photos'
    and (
      auth.uid()::text = (string_to_array(name, '/'))[1]
      or public.is_active_co_host_of(((string_to_array(name, '/'))[1])::uuid)
    )
  );

drop policy if exists "listing_photos_owner_delete" on storage.objects;
create policy "listing_photos_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'listing-photos'
    and (
      auth.uid()::text = (string_to_array(name, '/'))[1]
      or public.is_active_co_host_of(((string_to_array(name, '/'))[1])::uuid)
    )
  );
