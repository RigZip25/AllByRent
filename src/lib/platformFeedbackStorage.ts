/**
 * In-app help / complaint / feedback.
 * Saved locally always; also POSTed to /api/feedback when available.
 */

export const PLATFORM_FEEDBACK_KEY = "evorios_platform_feedback_v1";
export const PLATFORM_FEEDBACK_CHANGED_EVENT = "evorios-platform-feedback-changed";

export type FeedbackKind = "help" | "complaint" | "idea" | "other";
export type FeedbackStatus = "new" | "seen" | "done";

export type PlatformFeedback = {
  id: string;
  kind: FeedbackKind;
  message: string;
  contactEmail: string;
  screenHint: string;
  userId: string | null;
  userEmail: string | null;
  status: FeedbackStatus;
  createdAt: string;
  source: "local" | "remote";
};

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `fb_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function readLocal(): PlatformFeedback[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PLATFORM_FEEDBACK_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PlatformFeedback[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((row) => row && typeof row.message === "string");
  } catch {
    return [];
  }
}

function writeLocal(rows: PlatformFeedback[]): void {
  try {
    localStorage.setItem(PLATFORM_FEEDBACK_KEY, JSON.stringify(rows.slice(0, 200)));
    window.dispatchEvent(new CustomEvent(PLATFORM_FEEDBACK_CHANGED_EVENT));
  } catch {
    /* ignore */
  }
}

export function loadLocalFeedback(): PlatformFeedback[] {
  return readLocal().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function countNewLocalFeedback(): number {
  return readLocal().filter((r) => r.status === "new").length;
}

export function updateLocalFeedbackStatus(id: string, status: FeedbackStatus): void {
  const next = readLocal().map((row) => (row.id === id ? { ...row, status } : row));
  writeLocal(next);
}

export type SubmitFeedbackInput = {
  kind: FeedbackKind;
  message: string;
  contactEmail?: string;
  screenHint?: string;
  userId?: string | null;
  userEmail?: string | null;
};

export async function submitPlatformFeedback(
  input: SubmitFeedbackInput,
): Promise<{ ok: boolean; local: PlatformFeedback; remoteOk: boolean }> {
  const message = input.message.trim().slice(0, 4000);
  const row: PlatformFeedback = {
    id: newId(),
    kind: input.kind,
    message,
    contactEmail: (input.contactEmail ?? "").trim().slice(0, 200),
    screenHint: (input.screenHint ?? "").trim().slice(0, 120),
    userId: input.userId ?? null,
    userEmail: input.userEmail ?? null,
    status: "new",
    createdAt: new Date().toISOString(),
    source: "local",
  };

  writeLocal([row, ...readLocal()]);

  let remoteOk = false;
  try {
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: row.id,
        kind: row.kind,
        message: row.message,
        contactEmail: row.contactEmail,
        screenHint: row.screenHint,
        userId: row.userId,
        userEmail: row.userEmail,
      }),
    });
    remoteOk = res.ok;
  } catch {
    remoteOk = false;
  }

  return { ok: message.length > 0, local: row, remoteOk };
}

export async function fetchRemoteFeedback(opsPassword: string): Promise<PlatformFeedback[]> {
  try {
    const res = await fetch("/api/feedback", {
      method: "GET",
      headers: { "x-ops-key": opsPassword },
    });
    if (!res.ok) return [];
    const payload = (await res.json()) as { ok?: boolean; items?: PlatformFeedback[] };
    if (!payload?.ok || !Array.isArray(payload.items)) return [];
    return payload.items.map((item) => ({ ...item, source: "remote" as const }));
  } catch {
    return [];
  }
}

export async function patchRemoteFeedbackStatus(
  opsPassword: string,
  id: string,
  status: FeedbackStatus,
): Promise<boolean> {
  try {
    const res = await fetch("/api/feedback", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-ops-key": opsPassword,
      },
      body: JSON.stringify({ id, status }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Merge local + remote by id (prefer newer status from remote when present). */
export function mergeFeedbackInbox(
  local: PlatformFeedback[],
  remote: PlatformFeedback[],
): PlatformFeedback[] {
  const map = new Map<string, PlatformFeedback>();
  for (const row of local) map.set(row.id, row);
  for (const row of remote) {
    const prev = map.get(row.id);
    if (!prev) {
      map.set(row.id, row);
      continue;
    }
    map.set(row.id, {
      ...prev,
      ...row,
      source: "remote",
      status: row.status || prev.status,
    });
  }
  return [...map.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
