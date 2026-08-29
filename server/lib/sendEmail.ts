import type { SupabaseClient } from "@supabase/supabase-js";
import { APP_NAME, SUPPORT_EMAIL } from "./brand";

export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

export type SendEmailResult =
  | { ok: true; id?: string; provider: "resend" | "supabase_invite" | "supabase_otp" }
  | { ok: false; reason: string };

function resolveFromAddress(): string {
  const configured = process.env.EMAIL_FROM?.trim();
  if (configured) return configured;
  // send.evorios.com is DNS-ready for Resend; root @evorios.com is the usual From.
  return `${APP_NAME} <noreply@evorios.com>`;
}

function getResendApiKey(): string {
  return process.env.RESEND_API_KEY?.trim() || "";
}

export function isResendConfigured(): boolean {
  return Boolean(getResendApiKey());
}

/** True when we can deliver invite mail (Resend or Supabase Auth mailer). */
export function isTransactionalEmailConfigured(admin?: SupabaseClient | null): boolean {
  return isResendConfigured() || Boolean(admin);
}

/** Send a transactional email via Resend (preferred). */
export async function sendTransactionalEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    return { ok: false, reason: "RESEND_API_KEY not configured" };
  }

  const to = input.to.trim().toLowerCase();
  const subject = input.subject.trim();
  const text = input.text.trim();
  if (!to || !subject || !text) {
    return { ok: false, reason: "Missing to, subject, or text" };
  }

  const payload: Record<string, unknown> = {
    from: resolveFromAddress(),
    to: [to],
    subject,
    text,
  };
  if (input.html?.trim()) payload.html = input.html.trim();
  payload.reply_to = (input.replyTo?.trim() || SUPPORT_EMAIL).slice(0, 200);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const raw = (await response.json().catch(() => ({}))) as {
    id?: string;
    message?: string;
    name?: string;
  };

  if (!response.ok) {
    const detail = raw.message || raw.name || `HTTP ${response.status}`;
    return { ok: false, reason: detail };
  }

  return { ok: true, id: typeof raw.id === "string" ? raw.id : undefined, provider: "resend" };
}

/**
 * Fallback when Resend isn’t configured: use Supabase Auth’s mailer
 * (same path as sign-in codes — already working in production).
 *
 * New users get an invite email; existing users get a sign-in code email
 * that lands them on the invite URL after auth.
 */
export async function sendCoHostInviteViaSupabaseAuth(
  admin: SupabaseClient,
  email: string,
  inviteUrl: string,
): Promise<SendEmailResult> {
  const to = email.trim().toLowerCase();
  if (!to) return { ok: false, reason: "Missing email" };

  const invited = await admin.auth.admin.inviteUserByEmail(to, {
    redirectTo: inviteUrl,
    data: { evorios_co_host_invite: true },
  });

  if (!invited.error) {
    return { ok: true, provider: "supabase_invite" };
  }

  const msg = invited.error.message || "";
  const alreadyRegistered = /already|registered|exists|duplicate/i.test(msg);
  if (!alreadyRegistered) {
    return { ok: false, reason: msg || "Could not send invite email" };
  }

  // Existing account — send a sign-in OTP so their inbox gets mail; invite waits in-app.
  const otp = await admin.auth.signInWithOtp({
    email: to,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: inviteUrl,
    },
  });

  if (otp.error) {
    return { ok: false, reason: otp.error.message || "Could not send invite email" };
  }

  return { ok: true, provider: "supabase_otp" };
}
