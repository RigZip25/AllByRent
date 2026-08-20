import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAdminClient } from "../../lib/passkey/supabaseAdmin";

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

/**
 * Temporary/ops helper: look up auth user + profile + listings by email.
 * Gated by the same ops key as /api/feedback.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (!authorizeOps(req)) {
    res.status(401).json({ ok: false, error: "unauthorized" });
    return;
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body ?? {});
  const email = String(req.query.email ?? body.email ?? "")
    .trim()
    .toLowerCase();
  if (!email) {
    res.status(400).json({ ok: false, error: "email required" });
    return;
  }

  const admin = getAdminClient();
  if (!admin) {
    res.status(503).json({ ok: false, error: "admin unavailable" });
    return;
  }

  const { data: listed, error: listErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listErr) {
    res.status(500).json({ ok: false, error: listErr.message });
    return;
  }

  const authUsers = (listed?.users ?? []).filter(
    (u) => (u.email ?? "").toLowerCase() === email,
  );

  const { data: profilesByEmail, error: profileErr } = await admin
    .from("profiles")
    .select(
      "id,email,display_name,location_label,location_city,location_region,location_country,created_at,updated_at",
    )
    .eq("email", email);

  let profilesById: typeof profilesByEmail = [];
  if (authUsers.length) {
    const { data } = await admin
      .from("profiles")
      .select(
        "id,email,display_name,location_label,location_city,location_region,location_country,created_at,updated_at",
      )
      .in(
        "id",
        authUsers.map((u) => u.id),
      );
    profilesById = data ?? [];
  }

  const profileMap = new Map<string, NonNullable<typeof profilesByEmail>[number]>();
  for (const p of [...(profilesByEmail ?? []), ...(profilesById ?? [])]) {
    if (p?.id) profileMap.set(p.id, p);
  }
  const profiles = [...profileMap.values()];

  const ownerIds = [
    ...new Set([...authUsers.map((u) => u.id), ...profiles.map((p) => p.id)]),
  ];

  let listings: unknown[] = [];
  if (ownerIds.length) {
    const { data: rows } = await admin
      .from("listings")
      .select(
        "id,owner_id,title,city,listing_status,created_at,updated_at,availability,photos",
      )
      .in("owner_id", ownerIds)
      .order("updated_at", { ascending: false });
    listings = rows ?? [];
  }

  res.status(200).json({
    ok: true,
    email,
    authUsers: authUsers.map((u) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      email_confirmed_at: u.email_confirmed_at,
      user_metadata: u.user_metadata,
    })),
    profiles: profiles ?? [],
    profileError: profileErr?.message ?? null,
    listings,
  });
}
