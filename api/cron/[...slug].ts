import type { VercelRequest, VercelResponse } from "@vercel/node";

import rentalNoShow from "@allbyrent/server/routes/cron/rental-no-show";
import { resolveApiRouteKey } from "@allbyrent/server/lib/resolveApiRouteKey";
import rentalOverdue from "@allbyrent/server/routes/cron/rental-overdue";
import rentalPendingExpiry from "@allbyrent/server/routes/cron/rental-pending-expiry";

type Handler = (req: VercelRequest, res: VercelResponse) => unknown;

const ROUTES: Record<string, Handler> = {
  "rental-no-show": rentalNoShow,
  "rental-overdue": rentalOverdue,
  "rental-pending-expiry": rentalPendingExpiry,
};

export default function handler(req: VercelRequest, res: VercelResponse): unknown {
  const key = resolveApiRouteKey(req, "cron");
  const routeHandler = ROUTES[key];
  if (!routeHandler) {
    res.status(404).json({ error: "Not found", route: key || null });
    return;
  }
  return routeHandler(req, res);
}
