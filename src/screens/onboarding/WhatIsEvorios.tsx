import { OnboardingTopBar } from "../../components/OnboardingTopBar";
import { CategoryCatalogExplorer } from "../../components/CategoryCatalogExplorer";
import { APP_NAME, BRAND_AMBER, BRAND_GREEN } from "../../lib/brand";
import { useMessages } from "../../lib/i18n/react";
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
  const t = useMessages();
  const intro = t.onboarding.productIntro;

  return (
    <div className="screen onboarding-step mx-auto flex h-full min-h-0 w-full max-w-[390px] flex-col overflow-hidden bg-white">
      <OnboardingTopBar onBack={onBack} onSkip={onSkip} />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <div className="mx-auto mb-2 max-w-[200px]">
          <img
            src={onboardingAssets.garageRoles}
            alt=""
            className="h-auto w-full object-contain"
            draggable={false}
          />
        </div>

        <p className="text-center text-[13px] font-semibold uppercase tracking-wide text-gray-400">
          {APP_NAME}
        </p>
        <h1 className="mt-1 text-center text-[24px] font-extrabold leading-tight" style={{ color: GREEN }}>
          {intro.title}
        </h1>
        <p className="mt-2 text-center text-[16px] leading-relaxed text-gray-600">{intro.body}</p>

        <div className="mt-5">
          <p className="text-[14px] font-semibold uppercase tracking-wide text-gray-500">
            {intro.catalogTitle}
          </p>
          <div className="mt-2.5">
            <CategoryCatalogExplorer hint={intro.catalogHint} />
          </div>
        </div>

        <p className="mt-4 text-center text-[14px] leading-snug text-gray-500">{intro.nextHint}</p>
      </div>

      <div className="shrink-0 border-t px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-3" style={{ borderColor: BORDER }}>
        <button
          type="button"
          onClick={onContinue}
          className="w-full rounded-xl py-3.5 text-[17px] font-bold"
          style={{ backgroundColor: AMBER, color: GREEN }}
        >
          {intro.continueCta}
        </button>
      </div>
    </div>
  );
}
