import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors, handleOptions } from "../lib/cors";
import { getAnthropicApiKey } from "../lib/keys";

const UPSTREAM_URL = "https://api.anthropic.com/v1/messages";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : undefined;
  applyCors(res, origin);

  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = getAnthropicApiKey();
  if (!apiKey) {
    return res.status(503).json({ error: "Anthropic API key is not configured on the server" });
  }

  const anthropicVersion =
    (typeof req.headers["anthropic-version"] === "string" && req.headers["anthropic-version"]) ||
    "2023-06-01";

  const upstreamHeaders: Record<string, string> = {
    "x-api-key": apiKey,
    "anthropic-version": anthropicVersion,
    "content-type": "application/json",
  };

  const beta = req.headers["anthropic-beta"];
  if (typeof beta === "string" && beta.length > 0) {
    upstreamHeaders["anthropic-beta"] = beta;
  }

  let body: string;
  try {
    body = typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {});
  } catch {
    return res.status(400).json({ error: "Invalid request body" });
  }

  try {
    const upstream = await fetch(UPSTREAM_URL, {
      method: "POST",
      headers: upstreamHeaders,
      body,
    });

    const responseText = await upstream.text();
    res.status(upstream.status);
    res.setHeader("content-type", upstream.headers.get("content-type") ?? "application/json");
    return res.send(responseText);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upstream request failed";
    return res.status(502).json({ error: message });
  }
}
