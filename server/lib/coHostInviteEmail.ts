import { APP_NAME, MARKETING_URL, resolveConfiguredAppOrigin } from "./brand";

export type CoHostInviteEmailCopy = {
  inviteeName?: string;
  hostDisplayName?: string;
  hostEmail: string;
  garageName?: string;
  inviteUrl: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildCoHostInviteEmail(copy: CoHostInviteEmailCopy): {
  subject: string;
  text: string;
  html: string;
} {
  const appOrigin = resolveConfiguredAppOrigin();
  const invitee = (copy.inviteeName?.trim() || "there").slice(0, 60);
  const host =
    (copy.hostDisplayName?.trim() || copy.hostEmail.split("@")[0] || "A host").slice(0, 80);
  const garage = (copy.garageName?.trim() || "their garage").slice(0, 80);
  const inviteUrl = copy.inviteUrl.trim() || `${appOrigin}/?screen=coHosts&skipSplash=1`;

  const subject = `${host} invited you to co-host on ${APP_NAME}`;

  const text = [
    `Hi ${invitee},`,
    "",
    `${host} invited you as a co-host for “${garage}” on ${APP_NAME}.`,
    "You’ll use your own login (email code or Face ID) and can help stock the same garage.",
    "",
    `1) Open / download the app: ${appOrigin}`,
    `2) Open your invite: ${inviteUrl}`,
    "3) Sign in with the same email this invite was sent to, then accept under Co-hosts → Invitations for you.",
    "",
    `Payouts stay with the garage owner. Learn more: ${MARKETING_URL}`,
    "",
    `— ${APP_NAME}`,
  ].join("\n");

  const safeHost = escapeHtml(host);
  const safeGarage = escapeHtml(garage);
  const safeInvitee = escapeHtml(invitee);
  const safeUrl = escapeHtml(inviteUrl);
  const safeOrigin = escapeHtml(appOrigin);

  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F0F4F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F0F4F2;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;border:1px solid #E8E6E0;padding:28px 24px;">
          <tr>
            <td>
              <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#0D5C3A;">${APP_NAME}</p>
              <h1 style="margin:0 0 12px;font-size:22px;line-height:1.25;color:#0D5C3A;">You’re invited as a co-host</h1>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.5;color:#374151;">
                Hi ${safeInvitee}, <strong>${safeHost}</strong> invited you to help with <strong>“${safeGarage}”</strong>.
              </p>
              <p style="margin:0 0 20px;font-size:14px;line-height:1.5;color:#4B5563;">
                Sign in with this email (code or Face ID), open the invite, and accept under <em>Invitations for you</em>. Payouts stay with the garage owner.
              </p>
              <p style="margin:0 0 10px;">
                <a href="${safeUrl}" style="display:inline-block;background:#0D5C3A;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:12px 18px;border-radius:12px;">
                  Open invite
                </a>
              </p>
              <p style="margin:16px 0 0;font-size:12px;line-height:1.45;color:#6B7280;word-break:break-all;">
                Or open: ${safeUrl}<br/>App: ${safeOrigin}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}
