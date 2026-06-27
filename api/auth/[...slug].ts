import type { VercelRequest, VercelResponse } from "@vercel/node";

import authOtp from "@allbyrent/server/routes/auth/otp";
import { resolveApiRouteKey } from "@allbyrent/server/lib/safeHandler";
import deleteAccount from "@allbyrent/server/routes/auth/delete_account";

type Handler = (req: VercelRequest, res: VercelResponse) => unknown;

const ROUTES: Record<string, Handler> = {
  otp: authOtp,
  delete_account: deleteAccount,
};

export default function handler(req: VercelRequest, res: VercelResponse): unknown {
  const key = resolveApiRouteKey(req, "auth");
  const routeHandler = ROUTES[key];
  if (!routeHandler) {
    res.status(404).json({ error: "Not found", route: key || null });
    return;
  }
  return routeHandler(req, res);
}
