import { getIntegrationItems, type IntegrationStatus } from "../lib/config/integrations";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

function statusColor(status: IntegrationStatus): string {
  if (status === "ready") return GREEN;
  if (status === "partial") return "#D97706";
  return "#9CA3AF";
}

function statusLabel(status: IntegrationStatus): string {
  if (status === "ready") return "Ready";
  if (status === "partial") return "Partial";
  return "Not connected";
}

export function IntegrationStatusScreen({ onBack }: { onBack: () => void }) {
  const items = getIntegrationItems();
  const readyCount = items.filter((item) => item.status === "ready").length;

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <header className="shrink-0 flex items-center gap-3 px-4 pb-2 pt-3">
        <button
          type="button"
          onClick={onBack}
          className="text-[15px] font-semibold"
          style={{ color: GREEN }}
        >
          Back
        </button>
        <h1 className="text-[20px] font-bold" style={{ color: GREEN }}>
          Integrations
        </h1>
      </header>

      <div className="screen-scroll flex-1 px-4 pb-6">
        <p className="mb-4 text-[14px] leading-relaxed text-gray-600">
          UI and API routes are wired. Connect env vars and run Supabase migrations to go live.
          {readyCount > 0 ? ` ${readyCount} integration(s) already active.` : ""}
        </p>

        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border bg-white p-4"
              style={{ borderColor: BORDER }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[16px] font-bold" style={{ color: GREEN }}>
                    {item.label}
                  </p>
                  <p className="mt-1 text-[13px] text-gray-600">{item.summary}</p>
                </div>
                <span
                  className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold text-white"
                  style={{ backgroundColor: statusColor(item.status) }}
                >
                  {statusLabel(item.status)}
                </span>
              </div>
              <p className="mt-3 text-[12px] font-semibold text-gray-700">Next step</p>
              <p className="mt-1 text-[12px] leading-relaxed text-gray-500">{item.nextStep}</p>
              <p className="mt-3 text-[11px] font-mono text-gray-400">{item.envKeys.join(" · ")}</p>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-[12px] leading-relaxed text-gray-500">
          See <span className="font-semibold">docs/INTEGRATION_HANDOFF.md</span> in the repo for
          migrations, webhook events, and Stripe Price mapping.
        </p>
      </div>
    </div>
  );
}
