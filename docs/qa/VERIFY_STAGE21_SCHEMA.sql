-- Stage 21 verify: renter_attestations column present.
select
  (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'rentals'
      and column_name = 'renter_attestations'
  ) as renter_attestations_exists;
