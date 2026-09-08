/**
 * Reporting a listing, a message, a request or a person.
 *
 * A report is written to `content_reports` for the ops queue and kept locally
 * so the reporter still sees "we got this" when the network fails.
 */
import { getSupabaseClient, isSupabaseConfigured } from "../supabaseClient";

export const CONTENT_REPORTS_KEY = "evorios_content_reports_v1";
export const CONTENT_REPORTS_CHANGED_EVENT = "evorios-content-reports-changed";

export type ReportTargetKind = "listing" | "message" | "profile" | "request";

export type ReportReason =
  | "harassment"
  | "scam"
  | "off_platform"
  | "sexual"
  | "hate"
  | "violence"
  | "illegal_item"
  | "not_as_described"
  | "spam"
  | "other";

export type ReportStatus = "new" | "reviewing" | "actioned" | "dismissed";

/** Offered in this order; the last one asks for a written explanation. */
export const REPORT_REASONS: ReportReason[] = [
  "harassment",
  "scam",
  "off_platform",
  "sexual",
  "hate",
  "violence",
  "illegal_item",
  "not_as_described",
  "spam",
  "other",
];

export type ContentReport = {
  id: string;
  targetKind: ReportTargetKind;
  targetId: string;
  targetThreadKey: string;
  reportedUserId: string | null;
  reporterId: string | null;
  reason: ReportReason;
  details: string;
  evidence: string;
  status: ReportStatus;
  moderatorNote: string;
  createdAt: string;
  source: "local" | "remote";
};

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `rep_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function readLocal(): ContentReport[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CONTENT_REPORTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ContentReport[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((row) => row && typeof row.reason === "string");
  } catch {
    return [];
  }
}

function writeLocal(rows: ContentReport[]): void {
  try {
    localStorage.setItem(CONTENT_REPORTS_KEY, JSON.stringify(rows.slice(0, 100)));
    window.dispatchEvent(new CustomEvent(CONTENT_REPORTS_CHANGED_EVENT));
  } catch {
    /* ignore */
  }
}

export function loadLocalReports(): ContentReport[] {
  return readLocal().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** True once this exact thing has been reported, so the UI can say so. */
export function hasReported(targetKind: ReportTargetKind, targetId: string): boolean {
  const id = targetId.trim();
  if (!id) return false;
  return readLocal().some((row) => row.targetKind === targetKind && row.targetId === id);
}

export type SubmitReportInput = {
  targetKind: ReportTargetKind;
  targetId: string;
  targetThreadKey?: string;
  reportedUserId?: string | null;
  reporterId: string | null;
  reason: ReportReason;
  details?: string;
  /** Copy of the reported text: the author can delete the original. */
  evidence?: string;
};

export async function submitContentReport(
  input: SubmitReportInput,
): Promise<{ ok: boolean; report: ContentReport; remote: boolean }> {
  const report: ContentReport = {
    id: newId(),
    targetKind: input.targetKind,
    targetId: input.targetId.trim().slice(0, 200),
    targetThreadKey: (input.targetThreadKey ?? "").trim().slice(0, 200),
    reportedUserId: (input.reportedUserId ?? "") || null,
    reporterId: input.reporterId ?? null,
    reason: input.reason,
    details: (input.details ?? "").trim().slice(0, 4000),
    evidence: (input.evidence ?? "").trim().slice(0, 4000),
    status: "new",
    moderatorNote: "",
    createdAt: new Date().toISOString(),
    source: "local",
  };

  writeLocal([report, ...readLocal()]);

  if (!report.reporterId || !isSupabaseConfigured()) {
    return { ok: true, report, remote: false };
  }
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: true, report, remote: false };

  const { error } = await supabase.from("content_reports").insert({
    id: report.id,
    target_kind: report.targetKind,
    target_id: report.targetId,
    target_thread_key: report.targetThreadKey,
    reported_user_id: report.reportedUserId,
    reporter_id: report.reporterId,
    reason: report.reason,
    details: report.details,
    evidence: report.evidence,
  });
  if (error) {
    console.warn("report upload failed:", error.message);
    return { ok: true, report, remote: false };
  }
  return { ok: true, report, remote: true };
}

/** Ops queue. Reads go through the service-role route, like the feedback inbox. */
export async function fetchRemoteReports(opsPassword: string): Promise<ContentReport[]> {
  try {
    const res = await fetch("/api/ops/reports", {
      method: "GET",
      headers: { "x-ops-key": opsPassword },
    });
    if (!res.ok) return [];
    const payload = (await res.json()) as { ok?: boolean; items?: ContentReport[] };
    if (!payload?.ok || !Array.isArray(payload.items)) return [];
    return payload.items.map((item) => ({ ...item, source: "remote" as const }));
  } catch {
    return [];
  }
}

export async function patchRemoteReport(
  opsPassword: string,
  input: { id: string; status: ReportStatus; moderatorNote?: string },
): Promise<boolean> {
  try {
    const res = await fetch("/api/ops/reports", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-ops-key": opsPassword,
      },
      body: JSON.stringify(input),
    });
    return res.ok;
  } catch {
    return false;
  }
}
