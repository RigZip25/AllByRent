import { getIntegrationItems } from "../lib/config/integrations";
import { getSupabaseRequiredMessage } from "../lib/config/production";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

export function SetupRequiredScreen() {
  const items = getIntegrationItems().filter((item) => item.status !== "ready");

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <div className="screen-scroll flex-1 px-4 pb-8 pt-[max(1.5rem,env(safe-area-inset-top,0px))]">
        <h1 className="text-[22px] font-extrabold" style={{ color: GREEN }}>
          Production setup required
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-gray-600">
          {getSupabaseRequiredMessage()} This build does not run in offline demo mode.
        </p>

        <ul className="mt-5 flex flex-col gap-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border bg-white p-4"
              style={{ borderColor: BORDER }}
            >
              <p className="text-[15px] font-bold" style={{ color: GREEN }}>
                {item.label}
              </p>
              <p className="mt-1 text-[13px] text-gray-600">{item.nextStep}</p>
              <p className="mt-2 font-mono text-[11px] text-gray-400">{item.envKeys.join(" · ")}</p>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-[12px] leading-relaxed text-gray-500">
          See <span className="font-semibold">docs/INTEGRATION_HANDOFF.md</span> for the full deploy
          checklist.
        </p>
      </div>
    </div>
  );
}
