import type { VercelRequest, VercelResponse } from "@vercel/node";

import authOptions from "@allbyrent/server/routes/passkey/auth/options";
import { resolveApiRouteKey } from "@allbyrent/server/lib/resolveApiRouteKey";
import authVerify from "@allbyrent/server/routes/passkey/auth/verify";
import registerOptions from "@allbyrent/server/routes/passkey/register/options";
import registerVerify from "@allbyrent/server/routes/passkey/register/verify";

type Handler = (req: VercelRequest, res: VercelResponse) => unknown;

const ROUTES: Record<string, Handler> = {
  "auth/options": authOptions,
  "auth/verify": authVerify,
  "register/options": registerOptions,
  "register/verify": registerVerify,
};

export default function handler(req: VercelRequest, res: VercelResponse): unknown {
  const key = resolveApiRouteKey(req, "passkey");
  const routeHandler = ROUTES[key];
  if (!routeHandler) {
    res.status(404).json({ error: "Not found", route: key || null });
    return;
  }
  return routeHandler(req, res);
}
