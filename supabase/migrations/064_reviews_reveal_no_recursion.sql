-- Fix Stage 14 reviews RLS recursion for databases that already applied 063
-- with the inline `select count(*) from reviews` policy.

create or replace function public.review_pair_revealed(p_rental_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select (
    select count(*)::integer from public.reviews where rental_id = p_rental_id
  ) >= 2;
$$;

revoke all on function public.review_pair_revealed(uuid) from public;
grant execute on function public.review_pair_revealed(uuid) to anon, authenticated, service_role;

drop policy if exists "reviews_select_public_after_reveal" on public.reviews;
create policy "reviews_select_public_after_reveal"
  on public.reviews for select
  using (
    reviewee_id is not null
    and public.review_pair_revealed(rental_id)
  );

drop policy if exists "reviews_select_after_both_submitted" on public.reviews;
create policy "reviews_select_after_both_submitted"
  on public.reviews for select
  using (
    reviewee_id = auth.uid()
    and public.review_pair_revealed(rental_id)
  );
