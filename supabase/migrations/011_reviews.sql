-- Reviews table + blind review constraints

create table if not exists public.reviews (
  id uuid primary key,
  rental_id uuid not null references public.rentals (id) on delete cascade,
  reviewer_id uuid not null references auth.users (id) on delete cascade,
  reviewee_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'renter',
  rating int not null,
  comment text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists reviews_rental_id_idx on public.reviews (rental_id);
create index if not exists reviews_reviewee_id_idx on public.reviews (reviewee_id);

-- One review per reviewer per rental.
create unique index if not exists reviews_unique_reviewer_per_rental
  on public.reviews (rental_id, reviewer_id);

alter table public.reviews enable row level security;

-- Reviewer can insert their own review.
drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own"
  on public.reviews for insert
  with check (reviewer_id = auth.uid());

-- Reviewer can read their own submitted reviews.
drop policy if exists "reviews_select_own" on public.reviews;
create policy "reviews_select_own"
  on public.reviews for select
  using (reviewer_id = auth.uid());

-- Reviewee can read only after both sides submitted (blind review).
-- We consider the blind condition satisfied when there are >= 2 reviews for the rental.
drop policy if exists "reviews_select_after_both_submitted" on public.reviews;
create policy "reviews_select_after_both_submitted"
  on public.reviews for select
  using (
    reviewee_id = auth.uid()
    and (
      select count(*) from public.reviews r2 where r2.rental_id = reviews.rental_id
    ) >= 2
  );

