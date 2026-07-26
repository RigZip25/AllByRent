import { SUPPORT_EMAIL } from "../lib/brand";
import { getSupabaseRequiredMessage } from "../lib/config/production";

const GREEN = "#0D5C3A";

/** End-user facing gate when required integrations are missing — no env key dumps. */
export function SetupRequiredScreen() {
  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <div className="screen-scroll flex-1 px-4 pb-8 pt-[max(1.5rem,env(safe-area-inset-top,0px))]">
        <h1 className="text-[22px] font-extrabold" style={{ color: GREEN }}>
          We’ll be right back
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-gray-600">
          {getSupabaseRequiredMessage()}
        </p>
        <p className="mt-4 text-[14px] text-gray-500">
          If this keeps happening, email{" "}
          <a className="font-semibold underline" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
