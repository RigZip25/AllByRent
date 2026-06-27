import type { VercelRequest, VercelResponse } from "@vercel/node";

import orchestratorRun from "@allbyrent/server/routes/orchestrator/run";

type Handler = (req: VercelRequest, res: VercelResponse) => unknown;

const ROUTES: Record<string, Handler> = {
  run: orchestratorRun,
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
