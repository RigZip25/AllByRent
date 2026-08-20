import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Proxy US license plate → VIN via PlateToVIN (optional key).
 * Free account + 7-day cached repeats; without PLATE_TO_VIN_API_KEY we degrade
 * so the client can fall back to manual VIN + free NHTSA decode.
 *
 * Docs: https://platetovin.com/doc#plate-to-vin
 */

function trimEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

function getPlateToVinApiKey(): string | undefined {
  return trimEnv(
    process.env.PLATE_TO_VIN_API_KEY ||
      process.env.PLATETOVIN_API_KEY ||
      process.env.VEHICLE_PLATE_API_KEY,
  );
}

function normalizePlate(raw: string): string {
  return raw.replace(/[\s-]/g, "").toUpperCase();
}

function normalizeState(raw: string): string {
  return raw.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 2);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "private, max-age=300");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST, OPTIONS");
    return res.status(405).json({ ok: false, errorText: "method_not_allowed" });
  }

  const apiKey = getPlateToVinApiKey();
  if (!apiKey) {
    return res.status(503).json({
      ok: false,
      errorText: "plate_lookup_unconfigured",
      hint: "Set PLATE_TO_VIN_API_KEY for automatic plate→VIN. Manual VIN + NHTSA decode still works.",
    });
  }

  let plate = "";
  let state = "";
  if (req.method === "GET") {
    plate = normalizePlate(typeof req.query.plate === "string" ? req.query.plate : "");
    state = normalizeState(typeof req.query.state === "string" ? req.query.state : "");
  } else {
    const body = (typeof req.body === "object" && req.body) || {};
    plate = normalizePlate(typeof body.plate === "string" ? body.plate : "");
    state = normalizeState(typeof body.state === "string" ? body.state : "");
  }

  if (!plate || plate.length < 2 || plate.length > 10) {
    return res.status(400).json({ ok: false, errorText: "invalid_plate", plate, state });
  }
  if (state.length !== 2) {
    return res.status(400).json({ ok: false, errorText: "invalid_state", plate, state });
  }

  try {
    const upstream = await fetch("https://platetovin.com/api/convert", {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ state, plate }),
    });

    if (upstream.status === 401 || upstream.status === 403) {
      return res.status(502).json({ ok: false, plate, state, errorText: "upstream_auth" });
    }
    if (upstream.status === 404) {
      return res.status(200).json({ ok: false, plate, state, errorText: "not_found" });
    }
    if (!upstream.ok) {
      return res.status(502).json({ ok: false, plate, state, errorText: "upstream_error" });
    }

    const payload = (await upstream.json()) as Record<string, unknown>;
    const vin =
      typeof payload.vin === "string"
        ? payload.vin.replace(/[\s-]/g, "").toUpperCase()
        : "";
    const vehicle =
      payload.vehicle && typeof payload.vehicle === "object"
        ? (payload.vehicle as Record<string, unknown>)
        : payload;

    const make =
      (typeof vehicle.make === "string" && vehicle.make) ||
      (typeof payload.make === "string" && payload.make) ||
      undefined;
    const model =
      (typeof vehicle.model === "string" && vehicle.model) ||
      (typeof payload.model === "string" && payload.model) ||
      undefined;
    const modelYear = String(
      vehicle.year ?? payload.year ?? vehicle.modelYear ?? payload.modelYear ?? "",
    ).trim();

    if (!vin || vin.length !== 17) {
      return res.status(200).json({
        ok: false,
        plate,
        state,
        errorText: "not_found",
        make: make || undefined,
        model: model || undefined,
        modelYear: modelYear || undefined,
      });
    }

    return res.status(200).json({
      ok: true,
      plate,
      state,
      vin,
      make: make || undefined,
      model: model || undefined,
      modelYear: modelYear || undefined,
      trim:
        (typeof vehicle.trim === "string" && vehicle.trim) ||
        (typeof payload.trim === "string" && payload.trim) ||
        undefined,
    });
  } catch {
    return res.status(502).json({ ok: false, plate, state, errorText: "lookup_failed" });
  }
}
