import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors, handleOptions } from "../cors";
import { withApiErrorHandling } from "../safeHandler";
import { requireAgentKey } from "../agentAuth";
import { logAgentAction } from "../agentLogs";

export function agentHandler(params: {
  action: string;
  handler: (req: VercelRequest) => Promise<{ ok: boolean; data?: unknown; warning?: string }>;
}) {
  return withApiErrorHandling(async function handler(req: VercelRequest, res: VercelResponse) {
    if (handleOptions(req, res)) return;
    applyCors(res, typeof req.headers.origin === "string" ? req.headers.origin : undefined);

    const auth = requireAgentKey(req);
    if (!auth.ok) {
      await logAgentAction({
        action: params.action,
        endpoint: req.url ?? "",
        request: { method: req.method, body: req.body ?? null },
        result: { error: auth.error },
        ok: false,
      });
      res.status(auth.status).json({ ok: false, error: auth.error });
      return;
    }

    const result = await params.handler(req);
    await logAgentAction({
      action: params.action,
      endpoint: req.url ?? "",
      request: { method: req.method, body: req.body ?? null },
      result,
      ok: result.ok,
    });
    res.status(200).json(result);
  });
}

