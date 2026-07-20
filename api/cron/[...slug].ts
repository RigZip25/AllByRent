import type { VercelRequest, VercelResponse } from "@vercel/node";

import rentalNoShow from "@allbyrent/server/routes/cron/rental-no-show";
import rentalOverdue from "@allbyrent/server/routes/cron/rental-overdue";
import rentalPendingExpiry from "@allbyrent/server/routes/cron/rental-pending-expiry";
import abandonedListingNudge from "@allbyrent/server/routes/cron/abandoned-listing-nudge";

type Handler = (req: VercelRequest, res: VercelResponse) => unknown;

const ROUTES: Record<string, Handler> = {
  "rental-no-show": rentalNoShow,
  "rental-overdue": rentalOverdue,
  "rental-pending-expiry": rentalPendingExpiry,
  "abandoned-listing-nudge": abandonedListingNudge,
};

function routeKey(req: VercelRequest): string {
  const slug = req.query.slug;
  if (slug) return Array.isArray(slug) ? slug.join("/") : slug;
  const path = (req.url ?? "").split("?")[0] ?? "";
  const prefix = "/api/cron/";
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
