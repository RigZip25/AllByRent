-- Insurance cards, driver's licences and CDL scans sat in a public bucket.
--
-- `listing-verification` was created with `public = true` so a host could open
-- the renter's proof through a plain URL. The bucket also holds the renter's
-- insurance declaration page, and for vehicles, boats and heavy equipment the
-- licence and endorsement scans that go with it: anyone who guessed or was
-- handed one of those URLs could read the document, forever, signed in or not.
--
-- The bucket becomes private. A document is readable by the person who
-- uploaded it and, when it belongs to a rental, by the other side of that
-- rental — the host still opens the proof before handing the keys over, but
-- through a link that expires.

update storage.buckets set public = false where id = 'listing-verification';

/**
 * Who may read one object in `listing-verification`.
 *
 * Paths are `{uploaderId}/{rentalId|listingId}/{file}`. Runs as the caller on
 * purpose: `public.rentals` has row level security, so the participant check
 * cannot see rentals the caller is not part of even if this were called with a
 * name it has no business asking about.
 */
create or replace function public.can_read_verification_object(object_name text)
returns boolean
language plpgsql
stable
as $$
declare
  segments text[] := string_to_array(coalesce(object_name, ''), '/');
  caller uuid := auth.uid();
  rental_id uuid;
begin
  if caller is null or array_length(segments, 1) is null then
    return false;
  end if;

  -- Your own upload: the renter's proof, the host's QR photo.
  if segments[1] = caller::text then
    return true;
  end if;

  if array_length(segments, 1) < 2 then
    return false;
  end if;

  begin
    rental_id := segments[2]::uuid;
  exception
    when others then
      -- Not a rental document; only the uploader gets it.
      return false;
  end;

  return exists (
    select 1
    from public.rentals r
    where r.id = rental_id
      and (r.owner_id = caller or r.renter_id = caller)
  );
end;
$$;

grant execute on function public.can_read_verification_object(text)
  to anon, authenticated, service_role;

drop policy if exists "listing_verification_public_read" on storage.objects;

drop policy if exists "listing_verification_participant_read" on storage.objects;
create policy "listing_verification_participant_read"
  on storage.objects for select
  using (
    bucket_id = 'listing-verification'
    and public.can_read_verification_object(name)
  );
