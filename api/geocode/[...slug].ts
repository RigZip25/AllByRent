import type { VercelRequest, VercelResponse } from "@vercel/node";

import geocodeUs from "../../server/routes/geocode/us";
import geocodeUsps from "../../server/routes/geocode/usps";

type Handler = (req: VercelRequest, res: VercelResponse) => unknown;

const ROUTES: Record<string, Handler> = {
  us: geocodeUs,
  usps: geocodeUsps,
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
