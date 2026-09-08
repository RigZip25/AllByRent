-- Stage 11 / R15: production schema vs migrations (run in Supabase SQL editor).
-- Expect every column = 1.

select
  -- R1: private verification bucket
  (select count(*)::int from storage.buckets
     where id = 'listing-verification' and public = false) as r1_bucket_private,

  (select count(*)::int from pg_proc p
     join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public'
       and p.proname = 'can_read_verification_object') as r1_read_fn,

  -- R2/R3: settlement / handoff guards
  (select count(*)::int from pg_proc p
     join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public'
       and p.proname = 'rentals_guard_settlement') as r2_settlement_fn,

  (select count(*)::int from pg_trigger
     where tgname = 'rentals_guard_settlement') as r2_settlement_trg,

  -- R5: boost protect
  (select count(*)::int from pg_trigger
     where tgname = 'listings_protect_boost') as r5_boost_trg,

  -- R6: QR verification column
  (select count(*)::int from information_schema.columns
     where table_schema = 'public' and table_name = 'listings'
       and column_name = 'qr_verified_at') as r6_qr_verified_at,

  -- R7: dispute transition guard
  (select count(*)::int from pg_proc p
     join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public'
       and p.proname = 'disputes_guard_resolution') as r7_dispute_fn,

  (select count(*)::int from pg_trigger
     where tgname = 'disputes_guard_resolution') as r7_dispute_trg,

  -- R12: profile trust columns
  (select count(*)::int from information_schema.columns
     where table_schema = 'public' and table_name = 'profiles'
       and column_name in ('identity_verified', 'stripe_payouts_enabled', 'phone_verified')
  ) as r12_profile_trust_cols,

  -- R14 / storefront live flag
  (select count(*)::int from information_schema.columns
     where table_schema = 'public' and table_name = 'garage_storefronts'
       and column_name = 'store_live') as r14_store_live,

  -- R15: shop_slug unique index from 044
  (select count(*)::int from pg_indexes
     where schemaname = 'public'
       and indexname = 'garage_storefronts_shop_slug_unique') as r15_shop_slug_unique,

  -- R15: no duplicate non-empty slugs
  (select case when count(*) = 0 then 1 else 0 end
     from (
       select lower(shop_slug) as slug
       from public.garage_storefronts
       where shop_slug <> ''
       group by 1
       having count(*) > 1
     ) d) as r15_no_slug_dupes,

  -- Trusted writer helper
  (select count(*)::int from pg_proc p
     join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public'
       and p.proname = 'is_trusted_writer') as trusted_writer_fn,

  -- 061 already confirmed separately; keep as smoke check
  (select count(*)::int from information_schema.tables
     where table_schema = 'public' and table_name = 'open_sale_lot_results') as m061_lot_results;
