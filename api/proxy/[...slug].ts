import type { VercelRequest, VercelResponse } from "@vercel/node";

import anthropic from "@allbyrent/server/routes/anthropic";
import { resolveApiRouteKey } from "@allbyrent/server/lib/safeHandler";
import photoroom from "@allbyrent/server/routes/photoroom";

type Handler = (req: VercelRequest, res: VercelResponse) => unknown;

const ROUTES: Record<string, Handler> = {
  anthropic,
  photoroom,
};

export default function handler(req: VercelRequest, res: VercelResponse): unknown {
  const key = resolveApiRouteKey(req, "proxy");
  const routeHandler = ROUTES[key];
  if (!routeHandler) {
    res.status(404).json({ error: "Not found", route: key || null });
    return;
  }
  return routeHandler(req, res);
}
