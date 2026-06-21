/**
 * Account-level co-hosts for a primary host (v1: all listings on that host account).
 * Persisted in localStorage; optional Supabase table in supabase/migrations/002_co_hosts.sql.
 * Email delivery of invites is deferred — invites are stored locally until accepted in-app.
 */

const CO_HOSTS_KEY = "allbyrent_co_hosts";

export type CoHostStatus = "pending" | "active";

export type CoHostRecord = {
  id: string;
  /** Primary host account id (auth user id). */
  hostId: string;
  email: string;
  displayName?: string;
  status: CoHostStatus;
  invitedAt: string;
  acceptedAt?: string;
  /** Set when invitee accepts (auth user id). */
  coHostUserId?: string;
};

function createId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `cohost-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

export function loadCoHostRecords(): CoHostRecord[] {
  try {
    const raw = localStorage.getItem(CO_HOSTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row): row is CoHostRecord =>
        row &&
        typeof row === "object" &&
        typeof (row as CoHostRecord).id === "string" &&
        typeof (row as CoHostRecord).hostId === "string" &&
        typeof (row as CoHostRecord).email === "string" &&
        ((row as CoHostRecord).status === "pending" ||
          (row as CoHostRecord).status === "active"),
    );
  } catch {
    return [];
  }
}

function saveCoHostRecords(records: CoHostRecord[]): void {
  try {
    localStorage.setItem(CO_HOSTS_KEY, JSON.stringify(records));
  } catch {
    /* ignore */
  }
}

export function getCoHostsForHost(hostId: string): CoHostRecord[] {
  return loadCoHostRecords()
    .filter((r) => r.hostId === hostId)
    .sort((a, b) => b.invitedAt.localeCompare(a.invitedAt));
}

export function getPendingInvitesForEmail(email: string): CoHostRecord[] {
  const norm = normalizeEmail(email);
  if (!norm) return [];
  return loadCoHostRecords().filter(
    (r) => r.status === "pending" && normalizeEmail(r.email) === norm,
  );
}

export function getActiveCoHostHostIds(
  userId: string,
  email: string,
): string[] {
  const norm = normalizeEmail(email);
  return loadCoHostRecords()
    .filter(
      (r) =>
        r.status === "active" &&
        (r.coHostUserId === userId ||
          (norm.length > 0 && normalizeEmail(r.email) === norm)),
    )
    .map((r) => r.hostId);
}

export type InviteCoHostResult =
  | { ok: true; record: CoHostRecord }
  | { ok: false; error: string };

export function inviteCoHost(
  hostId: string,
  email: string,
  hostEmail: string,
): InviteCoHostResult {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (normalized === normalizeEmail(hostEmail)) {
    return { ok: false, error: "You cannot invite yourself." };
  }

  const records = loadCoHostRecords();
  const duplicate = records.find(
    (r) => r.hostId === hostId && normalizeEmail(r.email) === normalized,
  );
  if (duplicate) {
    return {
      ok: false,
      error:
        duplicate.status === "pending"
          ? "An invite is already pending for this email."
          : "This person is already a co-host.",
    };
  }

  const record: CoHostRecord = {
    id: createId(),
    hostId,
    email: normalized,
    status: "pending",
    invitedAt: new Date().toISOString(),
  };
  saveCoHostRecords([record, ...records]);
  return { ok: true, record };
}

export function removeCoHost(hostId: string, coHostId: string): boolean {
  const records = loadCoHostRecords();
  const next = records.filter((r) => !(r.hostId === hostId && r.id === coHostId));
  if (next.length === records.length) return false;
  saveCoHostRecords(next);
  return true;
}

export type AcceptCoHostResult =
  | { ok: true; record: CoHostRecord }
  | { ok: false; error: string };

export function acceptCoHostInvite(
  inviteId: string,
  acceptorUserId: string,
): AcceptCoHostResult {
  const records = loadCoHostRecords();
  const index = records.findIndex((r) => r.id === inviteId);
  if (index < 0) return { ok: false, error: "Invite not found." };
  const current = records[index]!;
  if (current.status !== "pending") {
    return { ok: false, error: "This invite is no longer pending." };
  }

  const updated: CoHostRecord = {
    ...current,
    status: "active",
    acceptedAt: new Date().toISOString(),
    coHostUserId: acceptorUserId,
  };
  const next = records.slice();
  next[index] = updated;
  saveCoHostRecords(next);
  return { ok: true, record: updated };
}

export function declineCoHostInvite(inviteId: string): boolean {
  const records = loadCoHostRecords();
  const next = records.filter((r) => r.id !== inviteId);
  if (next.length === records.length) return false;
  saveCoHostRecords(next);
  return true;
}

/** Primary host can activate a pending invite without email delivery. */
export function activateCoHostInvite(hostId: string, coHostId: string): boolean {
  const records = loadCoHostRecords();
  const index = records.findIndex((r) => r.hostId === hostId && r.id === coHostId);
  if (index < 0) return false;
  const current = records[index]!;
  if (current.status !== "pending") return false;
  const next = records.slice();
  next[index] = {
    ...current,
    status: "active",
    acceptedAt: new Date().toISOString(),
  };
  saveCoHostRecords(next);
  return true;
}
