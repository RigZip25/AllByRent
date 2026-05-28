-- Timestamps for no-show / overdue automation (cron + edge functions)

alter table public.rentals
  add column if not exists no_show_renter_notified_at timestamptz,
  add column if not exists no_show_automation_at timestamptz,
  add column if not exists overdue_hour_notified_at timestamptz,
  add column if not exists owner_recovery_notified_at timestamptz,
  add column if not exists safely_escalated_at timestamptz,
  add column if not exists rental_total_cents integer not null default 0;
