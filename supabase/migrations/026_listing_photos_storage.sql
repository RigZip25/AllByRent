-- Public gallery photos for published listings (browse / garage / item detail)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-photos',
  'listing-photos',
  true,
  10485760,
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "listing_photos_public_read" on storage.objects;
create policy "listing_photos_public_read"
  on storage.objects for select
  using (bucket_id = 'listing-photos');

drop policy if exists "listing_photos_owner_insert" on storage.objects;
create policy "listing_photos_owner_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-photos'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );

drop policy if exists "listing_photos_owner_update" on storage.objects;
create policy "listing_photos_owner_update"
  on storage.objects for update
  using (
    bucket_id = 'listing-photos'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  )
  with check (
    bucket_id = 'listing-photos'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );

drop policy if exists "listing_photos_owner_delete" on storage.objects;
create policy "listing_photos_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'listing-photos'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );
