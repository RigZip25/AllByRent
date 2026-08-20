import { HubChoiceCard } from "../components/HubChoiceCard";
import { LocationAreaControls } from "../components/LocationAreaControls";
import { BRAND_GREEN } from "../lib/brand";
import { onboardingAssets } from "../lib/onboardingAssets";
import { useOnboardingCopy } from "../lib/i18n/react";

const GREEN = BRAND_GREEN;

export type BrowseHubChoice = "findGear" | "yardSales";

type BrowseHubScreenProps = {
  onChoose: (choice: BrowseHubChoice) => void;
};

export function BrowseHubScreen({ onChoose }: BrowseHubScreenProps) {
  const { browseHub: copy } = useOnboardingCopy();

  return (
    <div className="screen onboarding-step mx-auto w-full max-w-[390px] bg-white">
      <div className="browse-hub-header shrink-0 px-4 pb-2 pt-[max(1.25rem,calc(env(safe-area-inset-top,0px)+0.75rem))]">
        <LocationAreaControls className="mb-3" variant="compact" />

        <div className="text-center">
          <h1 className="browse-hub-page-title font-bold tracking-tight" style={{ color: GREEN }}>
            {copy.title}
          </h1>
          <p className="browse-hub-page-subtitle mt-1 text-gray-500">{copy.subtitle}</p>
          <p className="browse-hub-trust mt-2.5" aria-label="Trust">
            <span>{copy.trustModes}</span>
            <span className="browse-hub-trust-dot" aria-hidden>
              ·
            </span>
            <span>{copy.trustDeposit}</span>
            <span className="browse-hub-trust-dot" aria-hidden>
              ·
            </span>
            <span>{copy.trustVerified}</span>
          </p>
        </div>
      </div>

      <div className="browse-hub-cards browse-hub-cards--duo">
        <HubChoiceCard
          variant="primary"
          imageSrc={onboardingAssets.browseBlock}
          title={copy.findGear.title}
          subtitle={copy.findGear.subtitle}
          ctaLabel={copy.findGear.cta}
          onClick={() => onChoose("findGear")}
        />
        <HubChoiceCard
          variant="yardSale"
          imageSrc={onboardingAssets.onBlock}
          title={copy.yardSales.title}
          subtitle={copy.yardSales.subtitle}
          ctaLabel={copy.yardSales.cta}
          onClick={() => onChoose("yardSales")}
        />
      </div>

      <p className="browse-hub-footer shrink-0 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] text-center text-sm text-gray-500">
        {copy.footer}
      </p>
    </div>
  );
}
