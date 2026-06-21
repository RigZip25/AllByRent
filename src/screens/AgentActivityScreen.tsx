import { useEffect, useState } from "react";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

type AgentLogRow = {
  id: string;
  created_at: string;
  actor: string;
  action: string;
  endpoint: string;
  ok: boolean;
};

type AgentActivityResponse = {
  ok?: boolean;
  error?: string;
  data?: { items?: AgentLogRow[] };
};

export function AgentActivityScreen({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState<AgentLogRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let timer = 0;
    const run = async () => {
      try {
        const key = (import.meta.env.VITE_AGENT_API_KEY as string | undefined) ?? "";
        const res = await fetch("/api/agent/activity", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-agent-key": key,
          },
          body: JSON.stringify({ limit: 80 }),
        });
        const payload = (await res.json()) as AgentActivityResponse;
        if (!mounted) return;
        if (!payload?.ok) {
          setError(payload?.error || "Agent feed unavailable.");
          return;
        }
        setError(null);
        setItems(payload.data?.items ?? []);
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Agent feed unavailable.");
      }
      if (mounted) {
        timer = window.setTimeout(run, 4000);
      }
    };
    void run();
    return () => {
      mounted = false;
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className="screen flex flex-col bg-[#F0F4F2]">
      <header className="shrink-0 border-b bg-white px-4 py-3" style={{ borderColor: BORDER }}>
        <button type="button" onClick={onBack} className="text-sm font-semibold text-gray-600">
          Back
        </button>
        <h1 className="mt-2 text-[18px] font-extrabold" style={{ color: GREEN }}>
          Agent activity
        </h1>
        <p className="mt-1 text-[13px] text-gray-500">Auto-refreshing feed of agent actions.</p>
      </header>

      <div className="screen-scroll flex-1 p-4">
        <div className="mx-auto max-w-[420px] space-y-2">
          {error ? (
            <div className="rounded-2xl border bg-[#FEF2F2] p-3 text-[12px] text-red-700" style={{ borderColor: "#FECACA" }}>
              {error}
            </div>
          ) : null}
          {items.length === 0 ? (
            <div className="rounded-2xl border bg-white p-4 text-[13px] text-gray-500" style={{ borderColor: BORDER }}>
              No agent actions yet.
            </div>
          ) : (
            items.map((row) => (
              <div key={row.id} className="rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-bold" style={{ color: GREEN }}>
                      {row.action}
                    </p>
                    <p className="mt-0.5 truncate text-[12px] text-gray-500">{row.endpoint}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${row.ok ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                    {row.ok ? "OK" : "FAIL"}
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-gray-400">
                  {row.actor} · {new Date(row.created_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

