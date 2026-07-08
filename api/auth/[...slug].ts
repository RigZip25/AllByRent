import type { VercelRequest, VercelResponse } from "@vercel/node";

import authOtp from "@allbyrent/server/routes/auth/otp";
import deleteAccount from "@allbyrent/server/routes/auth/delete_account";
import passkeyAuthOptions from "@allbyrent/server/routes/passkey/auth/options";
import passkeyAuthVerify from "@allbyrent/server/routes/passkey/auth/verify";
import passkeyRegisterOptions from "@allbyrent/server/routes/passkey/register/options";
import passkeyRegisterVerify from "@allbyrent/server/routes/passkey/register/verify";

type Handler = (req: VercelRequest, res: VercelResponse) => unknown;

const ROUTES: Record<string, Handler> = {
  otp: authOtp,
  delete_account: deleteAccount,
  "passkey-register-options": passkeyRegisterOptions,
  "passkey-register-verify": passkeyRegisterVerify,
  "passkey-auth-options": passkeyAuthOptions,
  "passkey-auth-verify": passkeyAuthVerify,
};

function routeKey(req: VercelRequest): string {
  const slug = req.query.slug;
  if (slug) {
    return Array.isArray(slug) ? slug.join("/") : slug;
  }

  const raw = req.url ?? "";
  let path = raw.split("?")[0] ?? "";
  if (path.startsWith("http")) {
    try {
      path = new URL(path).pathname;
    } catch {
      // ignore malformed URL
    }
  }

  const prefix = "/api/auth/";
  if (path.startsWith(prefix)) {
    return path.slice(prefix.length).replace(/\/$/, "");
  }

  return "";
}

export default function handler(req: VercelRequest, res: VercelResponse): unknown {
  const key = routeKey(req);
  const routeHandler = ROUTES[key];
  if (!routeHandler) {
    res.status(404).json({ error: "Not found", route: key || null });
    return;
  }
  return routeHandler(req, res);
}
