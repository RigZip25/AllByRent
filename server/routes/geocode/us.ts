import type { VercelRequest, VercelResponse } from "@vercel/node";

const CENSUS_BASE = "https://geocoding.geo.census.gov/geocoder";

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

  const benchmark =
    typeof req.query.benchmark === "string" ? req.query.benchmark : "Public_AR_Current";
  const format = "json";

  const street = typeof req.query.street === "string" ? req.query.street.trim() : "";
  const city = typeof req.query.city === "string" ? req.query.city.trim() : "";
  const state = typeof req.query.state === "string" ? req.query.state.trim() : "";
  const zip = typeof req.query.zip === "string" ? req.query.zip.trim() : "";
  const x = typeof req.query.x === "string" ? req.query.x.trim() : "";
  const y = typeof req.query.y === "string" ? req.query.y.trim() : "";
  const mode = typeof req.query.mode === "string" ? req.query.mode.trim() : "";

  let upstream: URL;
  if (x && y && mode === "geographies") {
    upstream = new URL(`${CENSUS_BASE}/geographies/coordinates`);
    upstream.searchParams.set("x", x);
    upstream.searchParams.set("y", y);
    upstream.searchParams.set("vintage", "Current_Current");
  } else if (street) {
    upstream = new URL(`${CENSUS_BASE}/locations/address`);
    upstream.searchParams.set("street", street);
    if (city) upstream.searchParams.set("city", city);
    if (state) upstream.searchParams.set("state", state);
    if (zip) upstream.searchParams.set("zip", zip);
  } else {
    const address = req.query.address;
    if (typeof address !== "string" || !address.trim()) {
      return res.status(400).json({ error: "Missing address or street query parameter" });
    }
    upstream = new URL(`${CENSUS_BASE}/locations/onelineaddress`);
    upstream.searchParams.set("address", address.trim());
  }

  upstream.searchParams.set("benchmark", benchmark);
  upstream.searchParams.set("format", format);

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
