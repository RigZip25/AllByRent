import type { VercelRequest } from "@vercel/node";

/** Vercel non-Next apps may leave req.query.slug empty for api/*/[...slug].ts — parse the path. */
export function resolveApiRouteKey(req: VercelRequest, group: string): string {
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

  const prefixes = [`/api/${group}/`, `/${group}/`];
  for (const prefix of prefixes) {
    if (path.startsWith(prefix)) {
      const rest = path.slice(prefix.length).replace(/\/$/, "");
      if (rest) return rest;
    }
  }

  const segments = path.split("/").filter(Boolean);
  const groupIdx = segments.lastIndexOf(group);
  if (groupIdx >= 0 && groupIdx < segments.length - 1) {
    return segments.slice(groupIdx + 1).join("/");
  }

  return "";
}
