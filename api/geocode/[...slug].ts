import type { VercelRequest, VercelResponse } from "@vercel/node";

import geocodeUs from "@allbyrent/server/routes/geocode/us";
import { resolveApiRouteKey } from "@allbyrent/server/lib/resolveApiRouteKey";
import geocodeUsps from "@allbyrent/server/routes/geocode/usps";

type Handler = (req: VercelRequest, res: VercelResponse) => unknown;

const ROUTES: Record<string, Handler> = {
  us: geocodeUs,
  usps: geocodeUsps,
};

export default function handler(req: VercelRequest, res: VercelResponse): unknown {
  const key = resolveApiRouteKey(req, "geocode");
  const routeHandler = ROUTES[key];
  if (!routeHandler) {
    res.status(404).json({ error: "Not found", route: key || null });
    return;
  }
  return routeHandler(req, res);
}
