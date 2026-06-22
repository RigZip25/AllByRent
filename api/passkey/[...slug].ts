import type { VercelRequest, VercelResponse } from "@vercel/node";

import authOptions from "../../server/routes/passkey/auth/options";
import authVerify from "../../server/routes/passkey/auth/verify";
import registerOptions from "../../server/routes/passkey/register/options";
import registerVerify from "../../server/routes/passkey/register/verify";

type Handler = (req: VercelRequest, res: VercelResponse) => unknown;

const ROUTES: Record<string, Handler> = {
  "auth/options": authOptions,
  "auth/verify": authVerify,
  "register/options": registerOptions,
  "register/verify": registerVerify,
};

export default function handler(req: VercelRequest, res: VercelResponse): unknown {
  const slug = req.query.slug;
  const key = Array.isArray(slug) ? slug.join("/") : (slug ?? "");
  const routeHandler = ROUTES[key];
  if (!routeHandler) {
    res.status(404).json({ error: "Not found", route: key || null });
    return;
  }
  return routeHandler(req, res);
}
