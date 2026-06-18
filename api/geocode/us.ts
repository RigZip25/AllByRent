import type { VercelRequest, VercelResponse } from "@vercel/node";

/** Proxy US Census geocoder — browser cannot call census.gov directly (no CORS). */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const address = req.query.address;
  if (typeof address !== "string" || !address.trim()) {
    return res.status(400).json({ error: "Missing address query parameter" });
  }

  const upstream = new URL(
    "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress",
  );
  upstream.searchParams.set("address", address.trim());
  upstream.searchParams.set(
    "benchmark",
    typeof req.query.benchmark === "string" ? req.query.benchmark : "Public_AR_Current",
  );
  upstream.searchParams.set("format", "json");

  try {
    const response = await fetch(upstream.toString());
    const body = await response.text();
    res.status(response.status);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.send(body);
  } catch {
    return res.status(502).json({ error: "US geocoder upstream unavailable" });
  }
}
