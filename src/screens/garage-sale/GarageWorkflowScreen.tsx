import { ArrowLeft, ArrowDown, Clock, ShoppingBag } from "lucide-react";
import { BRAND_AMBER, BRAND_GREEN, ONBOARDING } from "../../lib/brand";
import { markGarageWorkflowSeen } from "../../lib/garageWorkflowStorage";
import { onboardingAssets } from "../../lib/onboardingAssets";
import listingSnap from "../../imports/listing_snap.png";

const GREEN = BRAND_GREEN;
const AMBER = BRAND_AMBER;
const BORDER = "#E8E6E0";

const { garageWorkflow: copy } = ONBOARDING;

const STEPS = [
  {
    icon: Clock,
    image: onboardingAssets.stockGarage,
    title: copy.step1Title,
    body: copy.step1Body,
  },
  {
    icon: null,
    image: listingSnap,
    title: copy.step2Title,
    body: copy.step2Body,
  },
  {
    icon: ShoppingBag,
    image: onboardingAssets.onBlock,
    title: copy.step3Title,
    body: copy.step3Body,
  },
] as const;

type GarageWorkflowScreenProps = {
  onBack: () => void;
  onContinue: () => void;
};

export function GarageWorkflowScreen({ onBack, onContinue }: GarageWorkflowScreenProps) {
  const finish = () => {
    markGarageWorkflowSeen();
    onContinue();
  };

  return (
    <div className="screen garage-workflow-screen flex flex-col overflow-hidden bg-[#FFF9F0]">
      <header
        className="shrink-0 border-b px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))]"
        style={{ borderColor: `${AMBER}44` }}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full border bg-white"
            style={{ borderColor: BORDER }}
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" style={{ color: GREEN }} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: AMBER }}>
              {copy.eyebrow}
            </p>
            <h1 className="text-lg font-bold leading-tight" style={{ color: GREEN }}>
              {copy.title}
            </h1>
          </div>
        </div>
        <p className="mt-2 text-[14px] leading-snug text-gray-600">{copy.subtitle}</p>
      </header>

      <div className="screen-scroll min-h-0 flex-1 px-4 py-3">
        <ol className="garage-workflow-steps flex flex-col gap-0">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <li key={step.title}>
                <div
                  className="garage-workflow-step rounded-2xl border bg-white p-3"
                  style={{ borderColor: index === 1 ? `${AMBER}66` : BORDER }}
                >
                  <div className="flex gap-3">
                    <div
                      className="garage-workflow-step-art relative shrink-0 overflow-hidden rounded-xl bg-[#F9FAFB]"
                      aria-hidden
                    >
                      <img
                        src={step.image}
                        alt=""
                        className="h-full w-full object-contain object-bottom"
                        draggable={false}
                      />
                      <span
                        className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold text-white"
                        style={{ backgroundColor: index === 1 ? AMBER : GREEN }}
                      >
                        {index + 1}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex items-center gap-1.5">
                        {StepIcon ? (
                          <StepIcon className="h-4 w-4 shrink-0" style={{ color: GREEN }} aria-hidden />
                        ) : null}
                        <h2 className="text-[15px] font-bold leading-snug text-gray-900">{step.title}</h2>
                      </div>
                      <p className="mt-1 text-[13px] leading-snug text-gray-500">{step.body}</p>
                    </div>
                  </div>
                </div>
                {index < STEPS.length - 1 ? (
                  <div className="flex justify-center py-1" aria-hidden>
                    <ArrowDown className="h-4 w-4 text-amber-400" strokeWidth={2.5} />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="shrink-0 border-t bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-3" style={{ borderColor: BORDER }}>
        <button
          type="button"
          onClick={finish}
          className="w-full rounded-xl py-3.5 text-base font-bold"
          style={{ backgroundColor: AMBER, color: GREEN }}
        >
          {copy.cta}
        </button>
        <button
          type="button"
          onClick={finish}
          className="mt-2 w-full py-2 text-center text-[13px] font-semibold text-gray-500"
        >
          {copy.skip}
        </button>
      </div>
    </div>
  );
}
