-- Listing verification photo uploaded after printing/attaching QR

alter table public.listings
  add column if not exists qr_verification_photo_path text,
  add column if not exists qr_verified_at timestamptz;

create index if not exists listings_qr_verified_at_idx on public.listings (qr_verified_at);

