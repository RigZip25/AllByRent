import type { VercelRequest, VercelResponse } from "@vercel/node";

const NHTSA_BASE = "https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues";

function normalizeVin(raw: string): string {
  return raw.replace(/[\s-]/g, "").toUpperCase();
}

function isPlausibleVin(vin: string): boolean {
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(vin);
}

/** Proxy NHTSA VIN decode — browser CORS + consistent error shape. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "public, max-age=86400");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, OPTIONS");
    return res.status(405).json({ ok: false, errorText: "method_not_allowed" });
  }

  const vin = normalizeVin(typeof req.query.vin === "string" ? req.query.vin : "");
  if (!isPlausibleVin(vin)) {
    return res.status(400).json({ ok: false, vin, errorText: "invalid_vin" });
  }

  try {
    const upstream = new URL(`${NHTSA_BASE}/${encodeURIComponent(vin)}`);
    upstream.searchParams.set("format", "json");
    const response = await fetch(upstream.toString(), {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      return res.status(502).json({ ok: false, vin, errorText: "upstream_error" });
    }
    const payload = (await response.json()) as {
      Results?: Array<Record<string, string>>;
    };
    const row = payload.Results?.[0] ?? {};
    const errorCode = (row.ErrorCode ?? "").trim();
    const errorText = (row.ErrorText ?? "").trim();
    const make = (row.Make ?? "").trim();
    const model = (row.Model ?? "").trim();
    const modelYear = (row.ModelYear ?? "").trim();
    const vehicleType = (row.VehicleType ?? "").trim();

    // NHTSA uses "0" for success; other codes are warnings/errors.
    const ok = errorCode === "0" || errorCode.startsWith("0,") || Boolean(make || model);

    return res.status(200).json({
      ok,
      vin,
      make: make || undefined,
      model: model || undefined,
      modelYear: modelYear || undefined,
      vehicleType: vehicleType || undefined,
      errorText: ok ? undefined : errorText || "decode_failed",
    });
  } catch {
    return res.status(502).json({ ok: false, vin, errorText: "lookup_failed" });
  }
}
