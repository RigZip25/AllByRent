-- Paste in Supabase SQL editor after applying 066_geo_and_access_secrets.sql.
-- Expect every column to return 1.

select
  (
    select case
      when exists (
        select 1 from information_schema.tables
        where table_schema = 'public' and table_name = 'listing_access_secrets'
      )
      then 1 else 0 end
  ) as access_secrets_table,
  (
    select case
      when exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'listings' and column_name = 'lat'
      )
      and exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'listings' and column_name = 'lng'
      )
      and exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'listings' and column_name = 'city_key'
      )
      then 1 else 0 end
  ) as listing_geo_columns,
  (
    select case
      when exists (
        select 1 from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'public' and p.proname = 'listings_within_radius'
      )
      then 1 else 0 end
  ) as radius_rpc,
  (
    select case
      when exists (
        select 1 from pg_trigger where tgname = 'profiles_sync_listing_geo'
      )
      then 1 else 0 end
  ) as profile_geo_sync,
  (
    select case
      when not exists (
        select 1 from public.listings
        where handoff ? 'contactlessInstructions'
        limit 1
      )
      then 1 else 0 end
  ) as handoff_codes_stripped;
