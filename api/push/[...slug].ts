import type { VercelRequest, VercelResponse } from "@vercel/node";

import pushSend from "@allbyrent/server/routes/push/send";
import { resolveApiRouteKey } from "../lib/resolveRouteKey";

type Handler = (req: VercelRequest, res: VercelResponse) => unknown;

const ROUTES: Record<string, Handler> = {
  send: pushSend,
};

export default function handler(req: VercelRequest, res: VercelResponse): unknown {
  const key = resolveApiRouteKey(req, "push");
  const routeHandler = ROUTES[key];
  if (!routeHandler) {
    res.status(404).json({ error: "Not found", route: key || null });
    return;
  }
  return routeHandler(req, res);
}
