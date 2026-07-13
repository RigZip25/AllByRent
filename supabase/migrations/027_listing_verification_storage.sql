-- QR verification photos (private to listing owner; public read for browse trust badges)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-verification',
  'listing-verification',
  true,
  5242880,
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "listing_verification_public_read" on storage.objects;
create policy "listing_verification_public_read"
  on storage.objects for select
  using (bucket_id = 'listing-verification');

drop policy if exists "listing_verification_owner_insert" on storage.objects;
create policy "listing_verification_owner_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-verification'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );

drop policy if exists "listing_verification_owner_update" on storage.objects;
create policy "listing_verification_owner_update"
  on storage.objects for update
  using (
    bucket_id = 'listing-verification'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  )
  with check (
    bucket_id = 'listing-verification'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );

drop policy if exists "listing_verification_owner_delete" on storage.objects;
create policy "listing_verification_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'listing-verification'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );
