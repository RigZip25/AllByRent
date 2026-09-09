-- Stage 22 verify: client can no longer insert rentals (Q8).
-- Expect rentals_insert_policy_gone = 1 (policy absent).
select
  case
    when not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'rentals'
        and policyname = 'rentals_insert_owner_or_renter'
    )
    then 1
    else 0
  end as rentals_insert_policy_gone;
