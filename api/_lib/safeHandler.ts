import type { VercelRequest, VercelResponse } from "@vercel/node";

type ApiHandler = (req: VercelRequest, res: VercelResponse) => Promise<void> | void;

/** Return JSON 500 instead of an opaque FUNCTION_INVOCATION_FAILED when the handler throws. */
export function withApiErrorHandling(handler: ApiHandler): ApiHandler {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error("[api]", error);
      if (!res.headersSent) {
        const message = error instanceof Error ? error.message : "Internal server error";
        res.status(500).json({ error: message });
      }
    }
  };
}
