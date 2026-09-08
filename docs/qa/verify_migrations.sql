-- Which of migrations 050–059 are live in this database.
-- Paste into the Supabase SQL editor: every column should come back 1.

select
  (select count(*) from information_schema.columns
     where table_schema='public' and table_name='requests' and column_name='fulfilled_at')          as m050_requests,
  (select count(*) from information_schema.columns
     where table_schema='public' and table_name='messages' and column_name='request_id')            as m051_threads,
  (select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace
     where n.nspname='public' and p.proname='can_read_verification_object')                         as m052_documents,
  (select count(*) from pg_trigger where tgname='rentals_guard_settlement')                         as m053_settlement,
  (select count(*) from pg_trigger where tgname='disputes_guard_resolution')                        as m054_disputes,
  (select count(*) from pg_policies
     where schemaname='public' and tablename='requests' and policyname='requests_select_live')      as m055_reads,
  (select count(*) from information_schema.columns
     where table_schema='public' and table_name='rentals' and column_name='pickup_condition_photo_path') as m056_photos,
  (select count(*) from pg_views where schemaname='public' and viewname='public_profiles')          as m057_profiles,
  (select count(*) from information_schema.columns
     where table_schema='public' and table_name='rentals' and column_name='pickup_grace_until')     as m058_late,
  (select count(*) from pg_trigger where tgname='listings_block_delete_with_live_rental')           as m059_delete_guard;
