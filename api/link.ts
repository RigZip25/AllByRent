import type { VercelRequest, VercelResponse } from "@vercel/node";
import { APP_HOST, APP_NAME } from "@allbyrent/server/lib/brand";
import { withApiErrorHandling } from "@allbyrent/server/lib/safeHandler";
import {
  buildAppDeepLink,
  buildOgImageUrl,
  buildShareLink,
  resolveOgShareContext,
} from "@allbyrent/server/lib/ogResolve";

function siteOrigin(req: VercelRequest): string {
  const host = req.headers["x-forwarded-host"] || req.headers.host || APP_HOST;
  const proto = req.headers["x-forwarded-proto"] || "https";
  return `${proto}://${Array.isArray(host) ? host[0] : host}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    res.status(405).send("Method not allowed");
    return;
  }

  const origin = siteOrigin(req);
  const garage = typeof req.query.garage === "string" ? req.query.garage : undefined;
  const item = typeof req.query.item === "string" ? req.query.item : undefined;
  const listingId = typeof req.query.listingId === "string" ? req.query.listingId : undefined;

  const context = await resolveOgShareContext({ garage, item, listingId });
  const appUrl = buildAppDeepLink(origin, context.appQuery);
  const shareUrl = buildShareLink(origin, context.appQuery);
  const imageUrl = buildOgImageUrl(origin, context.imageParams);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

  if (req.method === "HEAD") {
    res.status(200).end();
    return;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(context.title)}</title>
    <meta name="description" content="${escapeHtml(context.description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${escapeHtml(APP_NAME)}" />
    <meta property="og:title" content="${escapeHtml(context.title)}" />
    <meta property="og:description" content="${escapeHtml(context.description)}" />
    <meta property="og:url" content="${escapeHtml(shareUrl)}" />
    <meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(context.title)}" />
    <meta name="twitter:description" content="${escapeHtml(context.description)}" />
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
    <meta http-equiv="refresh" content="0;url=${escapeHtml(appUrl)}" />
    <script>window.location.replace(${JSON.stringify(appUrl)});</script>
  </head>
  <body style="margin:0;background:#FFF9F0;color:#0D5C3A;font-family:system-ui,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px;text-align:center">
    <div>
      <p style="font-size:18px;font-weight:700;margin:0 0 8px">${escapeHtml(context.title)}</p>
      <p style="margin:0 0 16px;color:#4B5563">${escapeHtml(context.description)}</p>
      <a href="${escapeHtml(appUrl)}" style="color:#0D5C3A;font-weight:700">Open shelf →</a>
    </div>
  </body>
</html>`;

  res.status(200).send(html);
}

export default withApiErrorHandling(handler);
