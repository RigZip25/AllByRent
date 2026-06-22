import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors, handleOptions } from "../lib/cors";
import { getPhotoRoomApiKey } from "../lib/keys";

const UPSTREAM_URL = "https://image-api.photoroom.com/v2/edit";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function readRequestBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : undefined;
  applyCors(res, origin);

  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = getPhotoRoomApiKey();
  if (!apiKey) {
    return res.status(503).json({ error: "PhotoRoom API key is not configured on the server" });
  }

  const contentType = req.headers["content-type"];
  if (!contentType || !contentType.includes("multipart/form-data")) {
    return res.status(400).json({ error: "Expected multipart/form-data request body" });
  }

  try {
    const body = await readRequestBody(req);
    const upstream = await fetch(UPSTREAM_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "content-type": contentType,
      },
      body,
    });

    const responseBuffer = Buffer.from(await upstream.arrayBuffer());
    res.status(upstream.status);

    const upstreamContentType = upstream.headers.get("content-type");
    if (upstreamContentType) {
      res.setHeader("content-type", upstreamContentType);
    }

    const retryAfter = upstream.headers.get("retry-after");
    if (retryAfter) {
      res.setHeader("retry-after", retryAfter);
    }

    return res.send(responseBuffer);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upstream request failed";
    return res.status(502).json({ error: message });
  }
}
