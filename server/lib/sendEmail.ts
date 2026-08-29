import { APP_NAME, SUPPORT_EMAIL } from "./brand";

export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

export type SendEmailResult =
  | { ok: true; id?: string; provider: "resend" }
  | { ok: false; reason: string };

function resolveFromAddress(): string {
  const configured = process.env.EMAIL_FROM?.trim();
  if (configured) return configured;
  return `${APP_NAME} <noreply@evorios.com>`;
}

function getResendApiKey(): string {
  return process.env.RESEND_API_KEY?.trim() || "";
}

export function isTransactionalEmailConfigured(): boolean {
  return Boolean(getResendApiKey());
}

/** Send a transactional email via Resend (domain send.evorios.com is already DNS-ready). */
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
