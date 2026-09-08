/**
 * Agent / orchestrator routes are scaffolding stubs.
 * Disabled in production unless AGENT_SCAFFOLD_ENABLED=true.
 */
export function isAgentScaffoldEnabled(): boolean {
  const flag = String(process.env.AGENT_SCAFFOLD_ENABLED ?? "").trim().toLowerCase();
  if (flag === "true" || flag === "1" || flag === "yes") return true;
  if (flag === "false" || flag === "0" || flag === "no") return false;

  // Default: off on production deploys; allow local / preview without the flag.
  const vercelEnv = String(process.env.VERCEL_ENV ?? "").trim().toLowerCase();
  if (vercelEnv === "production") return false;
  if (process.env.NODE_ENV === "production" && vercelEnv === "") return false;
  return true;
}
