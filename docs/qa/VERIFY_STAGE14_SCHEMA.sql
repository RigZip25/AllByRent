-- Paste in Supabase SQL editor after applying 063_account_profile_stage14.sql.
-- Expect every row to return 1.

select
  (
    select case
      when exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'rentals'
          and column_name = 'owner_id'
          and is_nullable = 'YES'
      )
      and exists (
        select 1
        from information_schema.table_constraints tc
        join information_schema.referential_constraints rc
          on tc.constraint_name = rc.constraint_name
         and tc.constraint_schema = rc.constraint_schema
        join information_schema.key_column_usage kcu
          on tc.constraint_name = kcu.constraint_name
        where tc.table_schema = 'public'
          and tc.table_name = 'rentals'
          and kcu.column_name = 'owner_id'
          and tc.constraint_type = 'FOREIGN KEY'
          and rc.delete_rule = 'SET NULL'
      )
      then 1 else 0 end
  ) as rentals_owner_set_null,
  (
    select case
      when exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'co_hosts'
          and policyname = 'co_hosts_accept_invitee'
      )
      then 1 else 0 end
  ) as cohost_accept_policy,
  (
    select case
      when exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'reviews'
          and policyname = 'reviews_select_public_after_reveal'
      )
      then 1 else 0 end
  ) as reviews_public_reveal,
  (
    select case
      when exists (
        select 1 from information_schema.columns
        where table_schema = 'public'
          and table_name = 'profiles'
          and column_name = 'avatar_path'
      )
      and exists (
        select 1 from storage.buckets where id = 'avatars'
      )
      then 1 else 0 end
  ) as avatars_bucket_and_path,
  (
    select case
      when exists (
        select 1 from information_schema.columns
        where table_schema = 'public'
          and table_name = 'co_hosts'
          and column_name = 'can_manage_listings'
      )
      then 1 else 0 end
  ) as cohost_permission_bit;
