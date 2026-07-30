import { ONBOARDING } from "../../lib/brand";
import { onboardingAssets } from "../../lib/onboardingAssets";
import { setAppMode } from "../../lib/appMode";
import { OnboardingTopBar } from "../../components/OnboardingTopBar";

const GREEN = "#0D5C3A";
const AMBER = "#F59E0B";

const { roleChoice: copy } = ONBOARDING;

type WhatDoYouWantProps = {
  onEarn: () => void;
  onSave: () => void;
  onSkip: () => void;
  onBack: () => void;
};

export function WhatDoYouWant({ onEarn, onSave, onSkip, onBack }: WhatDoYouWantProps) {
  return (
    <div className="screen onboarding-step mx-auto w-full max-w-[390px] bg-white">
      <OnboardingTopBar onBack={onBack} onSkip={onSkip} />
      <div className="shrink-0 px-4 pb-2 pt-2 text-center">
        <h1 className="text-2xl font-bold" style={{ color: GREEN }}>
          {copy.title}
        </h1>
        <p className="mt-1 text-base text-gray-500">{copy.subtitle}</p>
      </div>

      {/*
        Cards must be shrink-0: this column is a flex scroller. Default flex-shrink
        crushed the CTAs on short phones and scrollHeight never grew, so the second
        active button was clipped with no way to reach it.
      */}
      <div className="screen-scroll flex flex-col gap-4 px-4 py-4 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]">
        <article className="shrink-0 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
          <div className="what-do-you-want-art rounded-t-2xl">
            <img
              src={onboardingAssets.stockGarage}
              alt=""
              width={1536}
              height={1024}
              className="what-do-you-want-illustration"
              decoding="async"
              fetchPriority="high"
              draggable={false}
            />
          </div>
          <div className="shrink-0 px-4 pb-4 pt-3 text-center">
            <h2 className="text-lg font-bold" style={{ color: GREEN }}>
              {copy.stockGarage.title}
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">{copy.stockGarage.subtitle}</p>
            <button
              type="button"
              onClick={() => {
                setAppMode("earn");
                onEarn();
              }}
              className="mt-4 w-full rounded-xl py-3 text-base font-bold transition-opacity active:opacity-90"
              style={{ backgroundColor: AMBER, color: GREEN }}
            >
              {copy.stockGarage.cta}
            </button>
          </div>
        </article>

        <article className="shrink-0 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
          <div className="what-do-you-want-art rounded-t-2xl">
            <img
              src={onboardingAssets.browseBlock}
              alt=""
              width={1536}
              height={1024}
              className="what-do-you-want-illustration"
              decoding="async"
              draggable={false}
            />
          </div>
          <div className="shrink-0 px-4 pb-4 pt-3 text-center">
            <h2 className="text-lg font-bold" style={{ color: GREEN }}>
              {copy.browseBlock.title}
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">{copy.browseBlock.subtitle}</p>
            <button
              type="button"
              onClick={() => {
                setAppMode("rent");
                onSave();
              }}
              className="mt-4 w-full rounded-xl border-2 py-3 text-base font-bold transition-opacity active:opacity-90"
              style={{ borderColor: GREEN, color: GREEN }}
            >
              {copy.browseBlock.cta}
            </button>
          </div>
        </article>

        <p className="shrink-0 pb-1 text-center text-xs text-gray-400">{copy.footer}</p>
      </div>
    </div>
  );
}
