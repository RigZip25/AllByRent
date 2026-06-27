import type { VercelRequest } from "@vercel/node";

/** Vercel non-Next apps may leave req.query.slug empty for api/*/[...slug].ts — parse the path. */
export function resolveApiRouteKey(req: VercelRequest, group: string): string {
  const slug = req.query.slug;
  if (slug) {
    return Array.isArray(slug) ? slug.join("/") : slug;
  }

  const raw = req.url ?? "";
  const path = raw.split("?")[0] ?? "";
  const prefix = `/api/${group}/`;
  if (path.startsWith(prefix)) {
    const rest = path.slice(prefix.length).replace(/\/$/, "");
    if (rest) return rest;
  }

  return "";
}
