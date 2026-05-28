-- Agent API + Orchestrator core tables

create table if not exists public.agent_logs (
  id uuid primary key,
  created_at timestamptz not null default now(),
  actor text not null default 'agent',
  action text not null,
  endpoint text not null,
  request jsonb not null default '{}'::jsonb,
  result jsonb not null default '{}'::jsonb,
  ok boolean not null default true
);

create index if not exists agent_logs_created_at_idx on public.agent_logs (created_at desc);
create index if not exists agent_logs_action_idx on public.agent_logs (action);

alter table public.agent_logs enable row level security;

-- No direct client access by default; service role reads/writes.
drop policy if exists "agent_logs_no_client_access" on public.agent_logs;
create policy "agent_logs_no_client_access"
  on public.agent_logs for all
  using (false)
  with check (false);

create table if not exists public.orchestrator_logs (
  id uuid primary key,
  created_at timestamptz not null default now(),
  goal text,
  actions_taken jsonb not null default '[]'::jsonb,
  results jsonb not null default '{}'::jsonb,
  next_steps text
);

create index if not exists orchestrator_logs_created_at_idx on public.orchestrator_logs (created_at desc);

alter table public.orchestrator_logs enable row level security;
drop policy if exists "orchestrator_logs_no_client_access" on public.orchestrator_logs;
create policy "orchestrator_logs_no_client_access"
  on public.orchestrator_logs for all
  using (false)
  with check (false);

create table if not exists public.agents_registry (
  id uuid primary key,
  created_at timestamptz not null default now(),
  name text not null,
  purpose text not null,
  status text not null default 'active',
  created_by text not null default 'orchestrator',
  performance_score numeric,
  last_run timestamptz,
  actions_count integer not null default 0
);

create index if not exists agents_registry_status_idx on public.agents_registry (status);
create index if not exists agents_registry_last_run_idx on public.agents_registry (last_run desc);

alter table public.agents_registry enable row level security;
drop policy if exists "agents_registry_no_client_access" on public.agents_registry;
create policy "agents_registry_no_client_access"
  on public.agents_registry for all
  using (false)
  with check (false);

