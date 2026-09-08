-- Paste in Supabase SQL editor after applying 065_reputation_stage18.sql.
-- Expect every column to return 1.

select
  (
    select case
      when exists (
        select 1 from information_schema.columns
        where table_schema = 'public'
          and table_name = 'profiles'
          and column_name = 'reviews_count'
      )
      and exists (
        select 1 from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'public' and p.proname = 'recalc_profile_rating'
      )
      then 1 else 0 end
  ) as rating_recalc,
  (
    select case
      when exists (
        select 1 from pg_constraint
        where conname = 'reviews_rating_range'
      )
      then 1 else 0 end
  ) as reviews_rating_check,
  (
    select case
      when pg_get_functiondef('public.review_pair_revealed(uuid)'::regprocedure)
        like '%14 days%'
      then 1 else 0 end
  ) as reveal_after_14_days,
  (
    select case
      when exists (
        select 1 from pg_trigger
        where tgname = 'disputes_apply_damage_reputation'
      )
      and exists (
        select 1 from information_schema.columns
        where table_schema = 'public'
          and table_name = 'profiles'
          and column_name = 'damage_dispute_count'
      )
      then 1 else 0 end
  ) as damage_reputation,
  (
    select case
      when exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'reviews'
          and column_name = 'rental_id'
          and is_nullable = 'YES'
      )
      then 1 else 0 end
  ) as reviews_rental_set_null;
