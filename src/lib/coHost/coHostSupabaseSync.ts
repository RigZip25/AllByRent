import type { CoHostRecord } from "../coHostStorage";
import { getSupabaseClient, isSupabaseConfigured } from "../supabaseClient";

function supabaseReady(): boolean {
  return isSupabaseConfigured() && Boolean(getSupabaseClient());
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function rowToRecord(row: {
  id: string;
  host_id: string;
  co_host_email: string;
  co_host_user_id: string | null;
  status: string;
  invited_at: string;
  accepted_at: string | null;
}): CoHostRecord {
  return {
    id: row.id,
    hostId: row.host_id,
    email: row.co_host_email,
    status: row.status as CoHostRecord["status"],
    invitedAt: row.invited_at,
    acceptedAt: row.accepted_at ?? undefined,
    coHostUserId: row.co_host_user_id ?? undefined,
  };
}

export async function fetchCoHostsForHostRemote(hostId: string): Promise<CoHostRecord[]> {
  if (!supabaseReady() || !isUuid(hostId)) return [];
  const supabase = getSupabaseClient()!;
  const { data, error } = await supabase
    .from("co_hosts")
    .select("id, host_id, co_host_email, co_host_user_id, status, invited_at, accepted_at")
    .eq("host_id", hostId)
    .order("invited_at", { ascending: false });
  if (error || !data) return [];
  return data.map(rowToRecord);
}

export async function fetchPendingCoHostInvitesRemote(email: string): Promise<CoHostRecord[]> {
  if (!supabaseReady()) return [];
  const normalized = email.trim().toLowerCase();
  if (!normalized) return [];
  const supabase = getSupabaseClient()!;
  const { data, error } = await supabase
    .from("co_hosts")
    .select("id, host_id, co_host_email, co_host_user_id, status, invited_at, accepted_at")
    .eq("status", "pending")
    .ilike("co_host_email", normalized);
  if (error || !data) return [];
  return data.map(rowToRecord);
}

export async function pushCoHostRemote(record: CoHostRecord): Promise<void> {
  if (!supabaseReady() || !isUuid(record.hostId)) return;
  const supabase = getSupabaseClient()!;
  await supabase.from("co_hosts").upsert({
    id: isUuid(record.id) ? record.id : undefined,
    host_id: record.hostId,
    co_host_email: record.email,
    co_host_user_id: record.coHostUserId ?? null,
    status: record.status,
    invited_at: record.invitedAt,
    accepted_at: record.acceptedAt ?? null,
  });
}

export async function deleteCoHostRemote(hostId: string, coHostId: string): Promise<void> {
  if (!supabaseReady() || !isUuid(hostId) || !isUuid(coHostId)) return;
  const supabase = getSupabaseClient()!;
  await supabase.from("co_hosts").delete().eq("host_id", hostId).eq("id", coHostId);
}
