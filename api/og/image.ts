import type { VercelRequest, VercelResponse } from "@vercel/node";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildOgSvg(input: {
  title: string;
  subtitle: string;
  price: string;
  badge: string;
}): string {
  const title = escapeXml(input.title);
  const subtitle = escapeXml(input.subtitle);
  const price = escapeXml(input.price);
  const badge = escapeXml(input.badge);

  const priceBlock = price
    ? `<text x="48" y="470" fill="#F0B429" font-size="52" font-weight="800" font-family="system-ui,sans-serif">${price}</text>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF9F0"/>
      <stop offset="38%" stop-color="#FDE9C3"/>
      <stop offset="100%" stop-color="#0D5C3A"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="40" y="40" rx="999" ry="999" width="${Math.min(420, badge.length * 18 + 44)}" height="52" fill="#F0B429"/>
  <text x="62" y="74" fill="#0D5C3A" font-size="28" font-weight="800" font-family="system-ui,sans-serif">${badge}</text>
  ${priceBlock}
  <text x="48" y="${price ? 540 : 500}" fill="#ffffff" font-size="54" font-weight="800" font-family="system-ui,sans-serif">${title}</text>
  <text x="48" y="${price ? 590 : 550}" fill="rgba(255,255,255,0.9)" font-size="28" font-family="system-ui,sans-serif">${subtitle}</text>
</svg>`;
}

export default function handler(req: VercelRequest, res: VercelResponse): void {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    res.status(405).send("Method not allowed");
    return;
  }

  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  const proto = req.headers["x-forwarded-proto"] || "https";
  const origin = `${proto}://${Array.isArray(host) ? host[0] : host}`;
  const url = new URL(req.url ?? "/api/og/image", origin);

  const title = (url.searchParams.get("title") || "Garage sale").slice(0, 90);
  const subtitle = (url.searchParams.get("subtitle") || "Tap to browse, buy, or offer").slice(0, 140);
  const price = (url.searchParams.get("price") || "").slice(0, 24);
  const badge = (url.searchParams.get("badge") || "Open garage").slice(0, 40);

  const svg = buildOgSvg({ title, subtitle, price, badge });

  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

  if (req.method === "HEAD") {
    res.status(200).end();
    return;
  }

  res.status(200).send(svg);
}
