-- Dispute resolve flow: reason/notes + resolution fields

alter table public.disputes
  add column if not exists reason_code text not null default 'other',
  add column if not exists notes text not null default '',
  add column if not exists proposed_outcome text,
  add column if not exists proposed_by uuid references auth.users (id) on delete set null,
  add column if not exists resolution_outcome text,
  add column if not exists resolved_at timestamptz,
  add column if not exists resolved_by uuid references auth.users (id) on delete set null,
  add column if not exists acknowledged_by uuid references auth.users (id) on delete set null;

comment on column public.disputes.reason_code is 'damage | missing_item | condition | deposit | other';
comment on column public.disputes.proposed_outcome is 'favor_renter | favor_host | split | withdrawn (pending counterparty ack)';
comment on column public.disputes.resolution_outcome is 'favor_renter | favor_host | split | withdrawn (final)';
