-- Add basic profile fields collected pre-auth (name + location)
-- Run in Supabase SQL editor or via CLI migration.

alter table public.profiles
  add column if not exists display_name text,
  add column if not exists location_label text,
  add column if not exists location_city text,
  add column if not exists location_region text,
  add column if not exists location_country text,
  add column if not exists location_country_code text,
  add column if not exists location_lat double precision,
  add column if not exists location_lng double precision;

