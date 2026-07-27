-- MyFantasticTrip schema
-- Run in Supabase SQL editor or via CLI

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  language text default 'ru',
  created_at timestamptz default now()
);

create table if not exists public.user_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  interests text[] default '{}',
  companions text,
  pace text,
  comfort_level int default 80,
  budget_min int default 3000,
  budget_max int default 12000
);

create table if not exists public.destinations (
  id text primary key,
  name text not null,
  country text not null,
  lat double precision,
  lng double precision,
  categories text[] default '{}',
  best_seasons text[] default '{}',
  safety_rating numeric(3,1),
  visa_info text,
  temperature_range text,
  description text,
  photos text[] default '{}'
);

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  destination_id text references public.destinations(id),
  title text not null,
  start_date date,
  end_date date,
  status text default 'draft',
  participant_count int default 1,
  total_cost numeric(12,2) default 0
);

create table if not exists public.trip_itinerary (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade,
  day_number int not null,
  location text,
  accommodation text,
  activities text[] default '{}',
  notes text
);

create table if not exists public.trip_bookings (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade,
  type text not null,
  provider text,
  reference text,
  status text default 'pending',
  cost numeric(12,2) default 0,
  details text
);

create table if not exists public.trip_packing (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  category text,
  item text not null,
  checked boolean default false,
  ai_suggested boolean default false
);

create table if not exists public.trip_members (
  trip_id uuid references public.trips(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  role text default 'guest',
  interests text[] default '{}',
  primary key (trip_id, user_id)
);

create table if not exists public.trip_activity_feed (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  type text,
  content text,
  created_at timestamptz default now()
);

create table if not exists public.trip_photos (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade,
  url text not null,
  location_tag text,
  created_at timestamptz default now()
);

alter table public.users enable row level security;
alter table public.user_profiles enable row level security;
alter table public.trips enable row level security;
alter table public.trip_itinerary enable row level security;
alter table public.trip_bookings enable row level security;
alter table public.trip_packing enable row level security;
alter table public.trip_members enable row level security;
alter table public.trip_activity_feed enable row level security;
alter table public.trip_photos enable row level security;

-- Destinations are public read
alter table public.destinations enable row level security;
drop policy if exists "destinations_public_read" on public.destinations;
create policy "destinations_public_read"
  on public.destinations for select using (true);
