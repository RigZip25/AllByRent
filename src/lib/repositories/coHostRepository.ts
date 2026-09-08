import {
  acceptCoHostInvite,
  declineCoHostInvite,
  getCoHostsForHost,
  getPendingInvitesForEmail,
  inviteCoHost,
  loadCoHostRecords,
  removeCoHost,
  type AcceptCoHostResult,
  type CoHostRecord,
} from "../coHostStorage";
import {
  acceptCoHostInviteRemote,
  deleteCoHostRemote,
  fetchCoHostInviteByIdRemote,
  fetchCoHostsForHostRemote,
  fetchPendingCoHostInvitesRemote,
  pushCoHostRemote,
} from "../coHost/coHostSupabaseSync";
import { sendCoHostInviteEmail } from "../coHostInviteEmail";
import { isSupabaseConfigured } from "../supabaseClient";
import { setActiveGarageHostId } from "../hostAccess";

function mergeCoHostRecords(remote: CoHostRecord[]): void {
  if (remote.length === 0) return;
  const local = loadCoHostRecords();
  const byId = new Map<string, CoHostRecord>();
  for (const record of local) byId.set(record.id, record);
  for (const record of remote) byId.set(record.id, record);
  try {
    localStorage.setItem("allbyrent_co_hosts", JSON.stringify([...byId.values()]));
  } catch {
    /* ignore */
  }
}

export async function syncCoHostsFromRemote(
  hostId: string,
  email: string,
  options?: { inviteId?: string | null },
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const inviteId = options?.inviteId?.trim() || null;
  const [hostRows, pendingRows, byId] = await Promise.all([
    fetchCoHostsForHostRemote(hostId),
    fetchPendingCoHostInvitesRemote(email),
    inviteId ? fetchCoHostInviteByIdRemote(inviteId) : Promise.resolve(null),
  ]);
  mergeCoHostRecords([
    ...hostRows,
    ...pendingRows,
    ...(byId ? [byId] : []),
  ]);
}

export type InviteCoHostWithEmailResult =
  | { ok: true; record: CoHostRecord; emailSent: boolean; emailError?: string }
  | { ok: false; error: string };

export async function inviteCoHostWithSync(
  hostId: string,
  email: string,
  hostEmail: string,
  displayName?: string,
  options?: { garageName?: string; hostDisplayName?: string; sendEmail?: boolean },
): Promise<InviteCoHostWithEmailResult> {
  const result = inviteCoHost(hostId, email, hostEmail, displayName);
  if (!result.ok) return result;

  await pushCoHostRemote(result.record);

  const shouldEmail = options?.sendEmail !== false;
  if (!shouldEmail) {
    return { ok: true, record: result.record, emailSent: false };
  }

  const mailed = await sendCoHostInviteEmail({
    record: result.record,
    garageName: options?.garageName,
    hostDisplayName: options?.hostDisplayName,
  });

  if (!mailed.ok) {
    return {
      ok: true,
      record: result.record,
      emailSent: false,
      emailError: mailed.error,
    };
  }

  return { ok: true, record: result.record, emailSent: true };
}

export async function removeCoHostWithSync(hostId: string, coHostId: string): Promise<boolean> {
  const removed = removeCoHost(hostId, coHostId);
  if (removed) {
    await deleteCoHostRemote(hostId, coHostId);
  }
  return removed;
}

export async function acceptCoHostInviteWithSync(
  inviteId: string,
  acceptorUserId: string,
): Promise<AcceptCoHostResult> {
  // Prefer server accept (RLS invitee policy) so local-only rows still activate remotely.
  const remote = await acceptCoHostInviteRemote(inviteId, acceptorUserId);
  if (remote) {
    mergeCoHostRecords([remote]);
    setActiveGarageHostId(remote.hostId);
    return { ok: true, record: remote };
  }

  const result = acceptCoHostInvite(inviteId, acceptorUserId);
  if (result.ok) {
    await pushCoHostRemote(result.record);
    setActiveGarageHostId(result.record.hostId);
  }
  return result;
}

export async function declineCoHostInviteWithSync(inviteId: string): Promise<boolean> {
  const records = loadCoHostRecords();
  const record = records.find((row) => row.id === inviteId);
  const declined = declineCoHostInvite(inviteId);
  if (declined && record) {
    await deleteCoHostRemote(record.hostId, inviteId);
  }
  return declined;
}

/** Hosts cannot activate invites; invitee must Accept (Stage 14 / P6a). */
export async function activateCoHostInviteWithSync(
  _hostId: string,
  _coHostId: string,
): Promise<boolean> {
  return false;
}

export { getCoHostsForHost, getPendingInvitesForEmail };
export type { CoHostRecord } from "../coHostStorage";
