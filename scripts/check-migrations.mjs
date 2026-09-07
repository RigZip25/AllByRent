#!/usr/bin/env node
/**
 * Applies every file in supabase/migrations to a throwaway Postgres database,
 * in order, so a broken migration fails here instead of in production.
 *
 * Needs a local server and the Supabase-provided pieces our SQL leans on
 * (auth schema, storage tables, the anon/authenticated/service_role roles).
 * Point PGHOST/PGPORT/PGUSER at the server; see docs/qa/MIGRATIONS.md.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "supabase", "migrations");
const database = process.env.MIGRATION_DB ?? "migration_check";

const psql = (args, sql) =>
  execFileSync("psql", ["-v", "ON_ERROR_STOP=1", "-q", ...args], {
    input: sql,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });

const SHIM = `
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin; end if;
end $$;
create schema if not exists auth;
create schema if not exists storage;
create schema if not exists extensions;
create extension if not exists pgcrypto;

create table auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  phone text,
  raw_user_meta_data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create or replace function auth.uid() returns uuid language sql stable as
  $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create or replace function auth.role() returns text language sql stable as
  $$ select coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), 'authenticated') $$;
create or replace function auth.jwt() returns jsonb language sql stable as
  $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;

alter role service_role bypassrls;
grant usage on schema auth to anon, authenticated, service_role;
grant execute on all functions in schema auth to anon, authenticated, service_role;
grant select on auth.users to anon, authenticated, service_role;

create table storage.buckets (
  id text primary key,
  name text not null,
  public boolean not null default false,
  file_size_limit bigint,
  allowed_mime_types text[],
  created_at timestamptz default now()
);
create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets (id),
  name text,
  owner uuid,
  metadata jsonb,
  created_at timestamptz default now()
);
alter table storage.objects enable row level security;

-- Realtime publication that migrations add tables to.
create publication supabase_realtime;
`;

try {
  psql(["-d", "postgres"], `drop database if exists ${database};`);
  psql(["-d", "postgres"], `create database ${database};`);
  psql(["-d", database], SHIM);
} catch (error) {
  console.error("Could not prepare the check database:");
  console.error(error.stderr || error.message);
  process.exit(1);
}

const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
let failed = 0;

for (const file of files) {
  const sql = fs.readFileSync(path.join(dir, file), "utf8");
  try {
    psql(["-d", database], sql);
    console.log(`ok   ${file}`);
  } catch (error) {
    failed += 1;
    const message = String(error.stderr || error.message).trim().split("\n").slice(0, 4);
    console.error(`FAIL ${file}`);
    for (const line of message) console.error(`     ${line}`);
  }
}

console.log(`\n${files.length - failed}/${files.length} migrations applied.`);

if (failed === 0) {
  const testDir = path.join(root, "supabase", "tests");
  const tests = fs.existsSync(testDir)
    ? fs.readdirSync(testDir).filter((f) => f.endsWith(".sql")).sort()
    : [];
  for (const file of tests) {
    const sql = fs.readFileSync(path.join(testDir, file), "utf8");
    try {
      psql(["-d", database], sql);
      console.log(`ok   tests/${file}`);
    } catch (error) {
      failed += 1;
      const message = String(error.stderr || error.message).trim().split("\n").slice(0, 6);
      console.error(`FAIL tests/${file}`);
      for (const line of message) console.error(`     ${line}`);
    }
  }
}

process.exit(failed === 0 ? 0 : 1);
