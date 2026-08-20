import type { VercelRequest, VercelResponse } from "@vercel/node";

import decodeVin from "@allbyrent/server/routes/vin/decode";
import lookupPlate from "@allbyrent/server/routes/vin/plate";

type Handler = (req: VercelRequest, res: VercelResponse) => unknown;

const ROUTES: Record<string, Handler> = {
  decode: decodeVin,
  plate: lookupPlate,
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
      // ignore
    }
  }

  const prefix = "/api/vin/";
  if (path.startsWith(prefix)) {
    return path.slice(prefix.length).replace(/\/$/, "");
  }

  return "";
}

export default function handler(req: VercelRequest, res: VercelResponse): unknown {
  const key = routeKey(req);
  const routeHandler = ROUTES[key];
  if (!routeHandler) {
    res.status(404).json({ ok: false, errorText: "not_found", route: key || null });
    return;
  }
  return routeHandler(req, res);
}
