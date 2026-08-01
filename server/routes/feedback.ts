import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAdminClient } from "../lib/passkey/supabaseAdmin";

type FeedbackKind = "help" | "complaint" | "idea" | "other";
type FeedbackStatus = "new" | "seen" | "done";

const KINDS = new Set<FeedbackKind>(["help", "complaint", "idea", "other"]);
const STATUSES = new Set<FeedbackStatus>(["new", "seen", "done"]);

function expectedOpsKey(): string {
  return (
    String(process.env.OPS_PASSWORD ?? "").trim() ||
    String(process.env.VITE_OPS_PASSWORD ?? "").trim() ||
    "GarageOps26"
  );
}

function authorizeOps(req: VercelRequest): boolean {
  const key = String(req.headers["x-ops-key"] ?? "").trim();
  return Boolean(key) && key === expectedOpsKey();
}

function mapRow(row: Record<string, unknown>) {
  return {
    id: String(row.id ?? ""),
    kind: (KINDS.has(row.kind as FeedbackKind) ? row.kind : "help") as FeedbackKind,
    message: String(row.message ?? ""),
    contactEmail: String(row.contact_email ?? ""),
    screenHint: String(row.screen_hint ?? ""),
    userId: row.user_id ? String(row.user_id) : null,
    userEmail: String(row.user_email ?? "") || null,
    status: (STATUSES.has(row.status as FeedbackStatus) ? row.status : "new") as FeedbackStatus,
    createdAt: String(row.created_at ?? new Date().toISOString()),
    source: "remote" as const,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = (req.method ?? "GET").toUpperCase();
  const admin = getAdminClient();

  if (method === "POST") {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const message = String(body.message ?? "").trim().slice(0, 4000);
    if (!message) {
      res.status(400).json({ ok: false, error: "message required" });
      return;
    }
    const kindRaw = String(body.kind ?? "help");
    const kind: FeedbackKind = KINDS.has(kindRaw as FeedbackKind)
      ? (kindRaw as FeedbackKind)
      : "help";
    const id =
      String(body.id ?? "").trim() ||
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `fb_${Date.now()}`);

    if (!admin) {
      res.status(200).json({ ok: true, stored: false, reason: "admin unavailable" });
      return;
    }

    const { error } = await admin.from("platform_feedback").upsert(
      {
        id,
        kind,
        message,
        contact_email: String(body.contactEmail ?? "").trim().slice(0, 200),
        screen_hint: String(body.screenHint ?? "").trim().slice(0, 120),
        user_id: body.userId ? String(body.userId) : null,
        user_email: String(body.userEmail ?? "").trim().slice(0, 200),
        status: "new",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    if (error) {
      res.status(200).json({ ok: true, stored: false, reason: error.message });
      return;
    }
    res.status(200).json({ ok: true, stored: true, id });
    return;
  }

  if (method === "GET") {
    if (!authorizeOps(req)) {
      res.status(401).json({ ok: false, error: "unauthorized" });
      return;
    }
    if (!admin) {
      res.status(200).json({ ok: true, items: [], warning: "admin unavailable" });
      return;
    }
    const { data, error } = await admin
      .from("platform_feedback")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
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
    if (!authorizeOps(req)) {
      res.status(401).json({ ok: false, error: "unauthorized" });
      return;
    }
    const body = (req.body ?? {}) as Record<string, unknown>;
    const id = String(body.id ?? "").trim();
    const statusRaw = String(body.status ?? "");
    if (!id || !STATUSES.has(statusRaw as FeedbackStatus)) {
      res.status(400).json({ ok: false, error: "id and status required" });
      return;
    }
    if (!admin) {
      res.status(200).json({ ok: true, updated: false, reason: "admin unavailable" });
      return;
    }
    const { error } = await admin
      .from("platform_feedback")
      .update({ status: statusRaw, updated_at: new Date().toISOString() })
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
