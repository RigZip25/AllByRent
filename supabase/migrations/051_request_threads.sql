-- A renter who posts "looking for a ladder" had no way of being contacted:
-- messages could only hang off a rental or a listing, so the neighbor who owns
-- the ladder had to publish a listing first just to say "I have one".
--
-- Same shape as the listing threads from 031: the ask is the thread anchor.

alter table public.messages
  add column if not exists request_id uuid references public.requests (id) on delete cascade;

create index if not exists messages_request_id_idx on public.messages (request_id);

alter table public.messages drop constraint if exists messages_thread_check;
alter table public.messages
  add constraint messages_thread_check
  check (rental_id is not null or listing_id is not null or request_id is not null);
