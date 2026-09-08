import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAdminClient } from "../../lib/passkey/supabaseAdmin";

/**
 * Moderation queue for the ops console. Reports are written by the reporter
 * under row level security; reading the whole queue and closing an item needs
 * the service role, so both live here behind the ops key.
 */

type ReportStatus = "new" | "reviewing" | "actioned" | "dismissed";

const STATUSES = new Set<ReportStatus>(["new", "reviewing", "actioned", "dismissed"]);

/** No fallback: an unset env must lock the queue, not open it to a shipped default. */
function expectedOpsKey(): string {
  return (
    String(process.env.OPS_PASSWORD ?? "").trim() ||
    String(process.env.VITE_OPS_PASSWORD ?? "").trim()
  );
}

function authorizeOps(req: VercelRequest): boolean {
  const key = String(req.headers["x-ops-key"] ?? "").trim();
  return Boolean(key) && key === expectedOpsKey();
}

function mapRow(row: Record<string, unknown>) {
  return {
    id: String(row.id ?? ""),
    targetKind: String(row.target_kind ?? "listing"),
    targetId: String(row.target_id ?? ""),
    targetThreadKey: String(row.target_thread_key ?? ""),
    reportedUserId: row.reported_user_id ? String(row.reported_user_id) : null,
    reporterId: row.reporter_id ? String(row.reporter_id) : null,
    reason: String(row.reason ?? "other"),
    details: String(row.details ?? ""),
    evidence: String(row.evidence ?? ""),
    status: (STATUSES.has(row.status as ReportStatus) ? row.status : "new") as ReportStatus,
    moderatorNote: String(row.moderator_note ?? ""),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    source: "remote" as const,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = (req.method ?? "GET").toUpperCase();

  if (!authorizeOps(req)) {
    res.status(401).json({ ok: false, error: "unauthorized" });
    return;
  }

  const admin = getAdminClient();

  if (method === "GET") {
    if (!admin) {
      res.status(200).json({ ok: true, items: [], warning: "admin unavailable" });
      return;
    }
    const { data, error } = await admin
      .from("content_reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      res.status(200).json({ ok: true, items: [], warning: error.message });
      return;
    }
    res.status(200).json({
      ok: true,
      items: (data ?? []).map((row) => mapRow(row as Record<string, unknown>)),
    });
    return;
  }

  if (method === "PATCH") {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const id = String(body.id ?? "").trim();
    const statusRaw = String(body.status ?? "");
    if (!id || !STATUSES.has(statusRaw as ReportStatus)) {
      res.status(400).json({ ok: false, error: "id and status required" });
      return;
    }
    if (!admin) {
      res.status(200).json({ ok: true, updated: false, reason: "admin unavailable" });
      return;
    }
    const { error } = await admin
      .from("content_reports")
      .update({
        status: statusRaw,
        moderator_note: String(body.moderatorNote ?? "").trim().slice(0, 2000),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) {
      res.status(200).json({ ok: true, updated: false, reason: error.message });
      return;
    }
    res.status(200).json({ ok: true, updated: true });
    return;
  }

  res.status(405).json({ ok: false, error: "method not allowed" });
}
