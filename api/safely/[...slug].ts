import type { VercelRequest, VercelResponse } from "@vercel/node";

import safelyQuote from "@allbyrent/server/routes/safely/quote";

type Handler = (req: VercelRequest, res: VercelResponse) => unknown;

const ROUTES: Record<string, Handler> = {
  quote: safelyQuote,
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
