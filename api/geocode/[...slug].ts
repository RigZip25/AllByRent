import type { VercelRequest, VercelResponse } from "@vercel/node";

import geocodeUs from "@allbyrent/server/routes/geocode/us";
import geocodeUsps from "@allbyrent/server/routes/geocode/usps";

type Handler = (req: VercelRequest, res: VercelResponse) => unknown;

const ROUTES: Record<string, Handler> = {
  us: geocodeUs,
  usps: geocodeUsps,
};

function routeKey(req: VercelRequest): string {
  const slug = req.query.slug;
  if (slug) {
    return Array.isArray(slug) ? slug.join("/") : slug;
  }

  const raw = req.url ?? "";
  let path = raw.split("?")[0] ?? "";
  if (path.startsWith("http")) {
    try {
      path = new URL(path).pathname;
    } catch {
      // ignore malformed URL
    }
  }

  const prefix = "/api/geocode/";
  if (path.startsWith(prefix)) {
    return path.slice(prefix.length).replace(/\/$/, "");
  }

  return "";
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
