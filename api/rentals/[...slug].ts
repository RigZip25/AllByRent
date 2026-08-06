import type { VercelRequest, VercelResponse } from "@vercel/node";

import confirmHandoff from "@allbyrent/server/routes/rentals/confirm-handoff";

type Handler = (req: VercelRequest, res: VercelResponse) => unknown;

const ROUTES: Record<string, Handler> = {
  "confirm-handoff": confirmHandoff,
};

function routeKey(req: VercelRequest): string {
  const slug = req.query.slug;
  if (slug) return Array.isArray(slug) ? slug.join("/") : slug;
  const path = (req.url ?? "").split("?")[0] ?? "";
  const prefix = "/api/rentals/";
  return path.startsWith(prefix) ? path.slice(prefix.length).replace(/\/$/, "") : "";
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
