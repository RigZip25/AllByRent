import { OnboardingTopBar } from "../../components/OnboardingTopBar";
import { CategoryCatalogExplorer } from "../../components/CategoryCatalogExplorer";
import { APP_NAME, BRAND_AMBER, BRAND_GREEN } from "../../lib/brand";
import { onboardingAssets } from "../../lib/onboardingAssets";

const GREEN = BRAND_GREEN;
const AMBER = BRAND_AMBER;
const BORDER = "#E8E6E0";

type Props = {
  onContinue: () => void;
  onSkip: () => void;
  onBack?: () => void;
};

export function WhatIsEvorios({ onContinue, onSkip, onBack }: Props) {
  return (
    <div className="screen onboarding-step mx-auto flex h-full min-h-0 w-full max-w-[390px] flex-col overflow-hidden bg-white">
      <OnboardingTopBar onBack={onBack} onSkip={onSkip} />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <div className="mx-auto mb-3 max-w-[280px]">
          <img
            src={onboardingAssets.garageRoles}
            alt=""
            className="h-auto w-full object-contain"
            draggable={false}
          />
        </div>

        <p className="text-center text-[12px] font-semibold uppercase tracking-wide text-gray-400">
          {APP_NAME}
        </p>
        <h1 className="mt-1 text-center text-[24px] font-extrabold leading-tight" style={{ color: GREEN }}>
          Your neighborhood marketplace
        </h1>
        <p className="mt-2 text-center text-[15px] leading-relaxed text-gray-600">
          Every household is a business cell on the block — a garage storefront that can{" "}
          <span className="font-semibold text-gray-800">rent</span>,{" "}
          <span className="font-semibold text-gray-800">sell</span>, or{" "}
          <span className="font-semibold text-gray-800">gift</span> what it owns.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { title: "Rent", hint: "Borrow & earn" },
            { title: "Sell", hint: "Buy nearby" },
            { title: "Gift", hint: "Pass along free" },
          ].map((mode) => (
            <div
              key={mode.title}
              className="rounded-2xl border px-2 py-3 text-center"
              style={{ borderColor: BORDER, backgroundColor: "#F7FBF8" }}
            >
              <p className="text-[14px] font-bold" style={{ color: GREEN }}>
                {mode.title}
              </p>
              <p className="mt-0.5 text-[11px] text-gray-500">{mode.hint}</p>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-gray-400">
            What neighbors share
          </p>
          <div className="mt-2">
            <CategoryCatalogExplorer
              hint="Tap any category to open subcategories — tools, garden plants, cameras, party gear, and more."
              defaultOpenFirst
            />
          </div>
        </div>

        <p className="mt-4 text-center text-[12px] leading-snug text-gray-500">
          Next you’ll choose: stock your garage, or browse the block.
        </p>
      </div>

      <div className="shrink-0 border-t px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-3" style={{ borderColor: BORDER }}>
        <button
          type="button"
          onClick={onContinue}
          className="w-full rounded-xl py-3.5 text-[16px] font-bold"
          style={{ backgroundColor: AMBER, color: GREEN }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
