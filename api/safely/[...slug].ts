import type { VercelRequest, VercelResponse } from "@vercel/node";

import safelyQuote from "@allbyrent/server/routes/safely/quote";
import { resolveApiRouteKey } from "../lib/resolveRouteKey";

type Handler = (req: VercelRequest, res: VercelResponse) => unknown;

const ROUTES: Record<string, Handler> = {
  quote: safelyQuote,
};

export default function handler(req: VercelRequest, res: VercelResponse): unknown {
  const key = resolveApiRouteKey(req, "safely");
  const routeHandler = ROUTES[key];
  if (!routeHandler) {
    res.status(404).json({ error: "Not found", route: key || null });
    return;
  }
  return routeHandler(req, res);
}
