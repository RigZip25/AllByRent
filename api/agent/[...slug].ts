import type { VercelRequest, VercelResponse } from "@vercel/node";

import activity from "@allbyrent/server/routes/agent/activity";
import finance from "@allbyrent/server/routes/agent/finance";
import growth from "@allbyrent/server/routes/agent/growth";
import listings from "@allbyrent/server/routes/agent/listings";
import marketing from "@allbyrent/server/routes/agent/marketing";
import market from "@allbyrent/server/routes/agent/market";
import pricing from "@allbyrent/server/routes/agent/pricing";
import safety from "@allbyrent/server/routes/agent/safety";

type Handler = (req: VercelRequest, res: VercelResponse) => unknown;

const ROUTES: Record<string, Handler> = {
  activity,
  finance,
  growth,
  listings,
  marketing,
  market,
  pricing,
  safety,
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

  const prefix = "/api/agent/";
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
