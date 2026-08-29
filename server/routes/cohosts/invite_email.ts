import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors, handleOptions } from "../../lib/cors";
import { withApiErrorHandling } from "../../lib/safeHandler";
import { getAdminClient, getUserFromBearer } from "../../lib/passkey/supabaseAdmin";
import { resolveConfiguredAppOrigin } from "../../lib/brand";
import { buildCoHostInviteEmail } from "../../lib/coHostInviteEmail";
import { isTransactionalEmailConfigured, sendTransactionalEmail } from "../../lib/sendEmail";

type Body = {
  inviteId?: string;
  email?: string;
  displayName?: string;
  garageName?: string;
  inviteUrl?: string;
  hostDisplayName?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function defaultInviteUrl(inviteId?: string): string {
  const origin = resolveConfiguredAppOrigin();
  if (inviteId?.trim()) {
    return `${origin}/?screen=coHosts&invite=${encodeURIComponent(inviteId.trim())}&skipSplash=1`;
  }
  return `${origin}/?screen=coHosts&skipSplash=1`;
}

export default withApiErrorHandling(async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  applyCors(res, typeof req.headers.origin === "string" ? req.headers.origin : undefined);

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const caller = await getUserFromBearer(req.headers.authorization);
  if (!caller) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (!isTransactionalEmailConfigured()) {
    res.status(503).json({
      ok: false,
      error: "Invite email is not configured yet. Ask support to set RESEND_API_KEY.",
      code: "email_not_configured",
    });
    return;
  }

  const body = (req.body ?? {}) as Body;
  const inviteId = typeof body.inviteId === "string" ? body.inviteId.trim() : "";
  const email = normalizeEmail(typeof body.email === "string" ? body.email : "");
  const displayName =
    typeof body.displayName === "string" ? body.displayName.trim().slice(0, 60) : "";
  const garageName =
    typeof body.garageName === "string" ? body.garageName.trim().slice(0, 80) : "";
  const hostDisplayName =
    typeof body.hostDisplayName === "string" ? body.hostDisplayName.trim().slice(0, 80) : "";
  const inviteUrlRaw =
    typeof body.inviteUrl === "string" ? body.inviteUrl.trim().slice(0, 500) : "";

  if (!EMAIL_RE.test(email)) {
    res.status(400).json({ error: "Valid invite email required" });
    return;
  }

  const hostEmail = normalizeEmail(caller.email ?? "");
  if (hostEmail && email === hostEmail) {
    res.status(400).json({ error: "You cannot invite yourself." });
    return;
  }

  const admin = getAdminClient();
  if (admin && inviteId && isUuid(inviteId) && isUuid(caller.id)) {
    const { data: row } = await admin
      .from("co_hosts")
      .select("id, host_id, co_host_email, status")
      .eq("id", inviteId)
      .maybeSingle();

    // Soft check: if the row exists it must belong to the caller.
    // Missing row is OK (local-first invite or sync race).
    if (row) {
      if (row.host_id !== caller.id) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      if (normalizeEmail(String(row.co_host_email ?? "")) !== email) {
        res.status(400).json({ error: "Invite email mismatch" });
        return;
      }
      if (row.status !== "pending") {
        res.status(400).json({ error: "Invite is no longer pending" });
        return;
      }
    }
  }

  const inviteUrl =
    inviteUrlRaw && /^https?:\/\//i.test(inviteUrlRaw)
      ? inviteUrlRaw
      : defaultInviteUrl(inviteId || undefined);

  const mail = buildCoHostInviteEmail({
    inviteeName: displayName || undefined,
    hostDisplayName: hostDisplayName || undefined,
    hostEmail: hostEmail || "host",
    garageName: garageName || undefined,
    inviteUrl,
  });

  const sent = await sendTransactionalEmail({
    to: email,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
    replyTo: hostEmail || undefined,
  });

  if (!sent.ok) {
    res.status(502).json({ ok: false, error: sent.reason, code: "send_failed" });
    return;
  }

  res.status(200).json({ ok: true, id: sent.id ?? null, provider: sent.provider });
});
