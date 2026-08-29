import {
  acceptCoHostInvite,
  activateCoHostInvite,
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
  deleteCoHostRemote,
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

export async function syncCoHostsFromRemote(hostId: string, email: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const [hostRows, pendingRows] = await Promise.all([
    fetchCoHostsForHostRemote(hostId),
    fetchPendingCoHostInvitesRemote(email),
  ]);
  mergeCoHostRecords([...hostRows, ...pendingRows]);
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
  const result = acceptCoHostInvite(inviteId, acceptorUserId);
  if (result.ok) {
    await pushCoHostRemote(result.record);
    // Land in the garage you just joined so stocking goes there; switcher can return home.
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

export async function activateCoHostInviteWithSync(hostId: string, coHostId: string): Promise<boolean> {
  const records = getCoHostsForHost(hostId);
  const current = records.find((row) => row.id === coHostId);
  const activated = activateCoHostInvite(hostId, coHostId);
  if (activated && current) {
    await pushCoHostRemote({
      ...current,
      status: "active",
      acceptedAt: new Date().toISOString(),
    });
  }
  return activated;
}

export { getCoHostsForHost, getPendingInvitesForEmail };
export type { CoHostRecord } from "../coHostStorage";
