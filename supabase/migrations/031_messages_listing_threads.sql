-- Listing (sell/gift) chat: messages may attach to a listing instead of a rental.

alter table public.messages
  alter column rental_id drop not null;

alter table public.messages
  add column if not exists listing_id uuid references public.listings (id) on delete cascade;

create index if not exists messages_listing_id_idx on public.messages (listing_id);

-- At least one of rental_id / listing_id must be set.
alter table public.messages drop constraint if exists messages_thread_check;
alter table public.messages
  add constraint messages_thread_check
  check (rental_id is not null or listing_id is not null);
