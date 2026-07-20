-- Neighbors need to see when a garage sale is open (yard hub).

drop policy if exists "garage_sale_schedules_public_read" on public.garage_sale_schedules;
create policy "garage_sale_schedules_public_read"
  on public.garage_sale_schedules for select
  using (true);
