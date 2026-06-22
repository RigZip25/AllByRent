import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getUspsWebToolsUserId } from "../../lib/keys";

export type UspsValidatedAddress = {
  address2: string;
  city: string;
  state: string;
  zip5: string;
  zip4?: string;
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * USPS Address Verify — standardizes to official mailing format (same database as mail delivery).
 * Requires USPS_WEBTOOLS_USER_ID on the server. Does not return coordinates; pair with Census.
 */
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

  const userId = getUspsWebToolsUserId();
  if (!userId) {
    return res.status(503).json({
      available: false,
      error: "USPS Web Tools user id is not configured (USPS_WEBTOOLS_USER_ID)",
    });
  }

  const street = typeof req.query.street === "string" ? req.query.street.trim() : "";
  const city = typeof req.query.city === "string" ? req.query.city.trim() : "";
  const state = typeof req.query.state === "string" ? req.query.state.trim() : "";
  const zip = typeof req.query.zip === "string" ? req.query.zip.trim() : "";

  if (!street && !city && !zip) {
    return res.status(400).json({ error: "Provide street, city, or zip" });
  }

  const xml = `<AddressValidateRequest USERID="${escapeXml(userId)}"><Address ID="0"><Address1></Address1><Address2>${escapeXml(street)}</Address2><City>${escapeXml(city)}</City><State>${escapeXml(state)}</State><Zip5>${escapeXml(zip)}</Zip5></Address></AddressValidateRequest>`;

  const upstream = new URL("https://secure.shippingapis.com/ShippingAPI.dll");
  upstream.searchParams.set("API", "Verify");
  upstream.searchParams.set("XML", xml);

  try {
    const response = await fetch(upstream.toString());
    const text = await response.text();
    if (!response.ok) {
      return res.status(502).json({ available: true, error: "USPS upstream error" });
    }

    const address2 = text.match(/<Address2>([^<]*)<\/Address2>/i)?.[1]?.trim() ?? "";
    const cityOut = text.match(/<City>([^<]*)<\/City>/i)?.[1]?.trim() ?? "";
    const stateOut = text.match(/<State>([^<]*)<\/State>/i)?.[1]?.trim() ?? "";
    const zip5 = text.match(/<Zip5>([^<]*)<\/Zip5>/i)?.[1]?.trim() ?? "";
    const zip4 = text.match(/<Zip4>([^<]*)<\/Zip4>/i)?.[1]?.trim() ?? "";
    const errorDesc = text.match(/<Description>([^<]*)<\/Description>/i)?.[1]?.trim();

    if (!address2 && !cityOut) {
      return res.status(404).json({
        available: true,
        error: errorDesc || "Address not found in USPS database",
      });
    }

    const result: UspsValidatedAddress = {
      address2: address2 || street,
      city: cityOut || city,
      state: stateOut || state,
      zip5: zip5 || zip,
      ...(zip4 ? { zip4 } : {}),
    };

    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.status(200).json({ available: true, address: result });
  } catch {
    return res.status(502).json({ available: true, error: "USPS upstream unavailable" });
  }
}
