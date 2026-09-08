-- Stage 12: HTTP surface guards
-- - stripe_webhook_events: idempotent Stripe webhook delivery by event.id
-- - api_rate_limits + take_rate_limit_token: shared proxyGuard counters (service role)

-- Paste into Supabase SQL editor if migrations are applied manually:

create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  event_type text,
  processed_at timestamptz not null default now()
);

create index if not exists stripe_webhook_events_processed_at_idx
  on public.stripe_webhook_events (processed_at);

alter table public.stripe_webhook_events enable row level security;
-- No client policies — service role (webhook handler) only.

create table if not exists public.api_rate_limits (
  bucket_key text primary key,
  window_start timestamptz not null default now(),
  count integer not null default 0 check (count >= 0),
  reset_at timestamptz not null
);

create index if not exists api_rate_limits_reset_at_idx
  on public.api_rate_limits (reset_at);

alter table public.api_rate_limits enable row level security;
-- No client policies — service role only.

create or replace function public.take_rate_limit_token(
  p_key text,
  p_max integer,
  p_window_ms integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  row_rec public.api_rate_limits%rowtype;
  now_ts timestamptz := clock_timestamp();
  reset_ts timestamptz;
  new_count integer;
  retry_sec integer;
begin
  if p_key is null or length(trim(p_key)) = 0 then
    return jsonb_build_object('ok', false, 'remaining', 0, 'retry_after_sec', 1, 'error', 'missing_key');
  end if;
  if p_max is null or p_max < 1 then
    return jsonb_build_object('ok', false, 'remaining', 0, 'retry_after_sec', 1, 'error', 'bad_max');
  end if;
  if p_window_ms is null or p_window_ms < 1000 then
    p_window_ms := 60000;
  end if;

  select * into row_rec
  from public.api_rate_limits
  where bucket_key = p_key
  for update;

  if not found or now_ts >= row_rec.reset_at then
    reset_ts := now_ts + make_interval(secs => greatest(1, ceil(p_window_ms::numeric / 1000.0)::integer));
    insert into public.api_rate_limits (bucket_key, window_start, count, reset_at)
    values (p_key, now_ts, 1, reset_ts)
    on conflict (bucket_key) do update
      set window_start = excluded.window_start,
          count = 1,
          reset_at = excluded.reset_at;
    retry_sec := greatest(1, ceil(extract(epoch from (reset_ts - now_ts))));
    return jsonb_build_object(
      'ok', true,
      'remaining', greatest(0, p_max - 1),
      'retry_after_sec', retry_sec
    );
  end if;

  if row_rec.count >= p_max then
    retry_sec := greatest(1, ceil(extract(epoch from (row_rec.reset_at - now_ts))));
    return jsonb_build_object(
      'ok', false,
      'remaining', 0,
      'retry_after_sec', retry_sec
    );
  end if;

  new_count := row_rec.count + 1;
  update public.api_rate_limits
  set count = new_count
  where bucket_key = p_key;

  retry_sec := greatest(1, ceil(extract(epoch from (row_rec.reset_at - now_ts))));
  return jsonb_build_object(
    'ok', true,
    'remaining', greatest(0, p_max - new_count),
    'retry_after_sec', retry_sec
  );
end;
$$;

revoke all on function public.take_rate_limit_token(text, integer, integer) from public;
revoke all on function public.take_rate_limit_token(text, integer, integer) from anon, authenticated;
grant execute on function public.take_rate_limit_token(text, integer, integer) to service_role;
