import { MapPin } from "lucide-react";
import { HubChoiceCard } from "../components/HubChoiceCard";
import { BRAND_AMBER, BRAND_GREEN } from "../lib/brand";
import { clusterLabelForCity, getClusterRadiusMi } from "../lib/clusterConfig";
import { getActiveRentLocationLabel, hasRentLocationSetup } from "../lib/listingStorage";
import { onboardingAssets } from "../lib/onboardingAssets";
import { useMessages, useOnboardingCopy } from "../lib/i18n/react";

const GREEN = BRAND_GREEN;
const AMBER = BRAND_AMBER;

export type BrowseHubChoice = "findGear" | "yardSales";

type BrowseHubScreenProps = {
  onChoose: (choice: BrowseHubChoice) => void;
  onEditLocation: () => void;
};

export function BrowseHubScreen({ onChoose, onEditLocation }: BrowseHubScreenProps) {
  const { browseHub: copy } = useOnboardingCopy();
  const { home } = useMessages();
  const city = getActiveRentLocationLabel().trim();
  const clusterLabel = clusterLabelForCity(city, getClusterRadiusMi());
  const needsLocation = !hasRentLocationSetup();

  return (
    <div className="screen onboarding-step mx-auto w-full max-w-[390px] bg-white">
      <div className="browse-hub-header shrink-0 px-4 pb-2 pt-[max(1.25rem,calc(env(safe-area-inset-top,0px)+0.75rem))]">
        <button
          type="button"
          onClick={onEditLocation}
          className="mb-3 flex min-w-0 max-w-full items-start gap-1.5 text-left"
          aria-label={needsLocation ? home.setBlockAria : home.changeBlockAria}
        >
          <MapPin
            className="mt-0.5 h-5 w-5 shrink-0"
            style={{ color: needsLocation ? AMBER : GREEN }}
            fill={needsLocation ? AMBER : GREEN}
            stroke={GREEN}
            strokeWidth={1.5}
          />
          <span
            className="min-w-0 flex-1 break-words text-base font-semibold leading-snug line-clamp-2"
            style={{ color: needsLocation ? "#B45309" : GREEN }}
          >
            {clusterLabel}
          </span>
        </button>

        <div className="text-center">
          <h1 className="browse-hub-page-title font-bold tracking-tight" style={{ color: GREEN }}>
            {copy.title}
          </h1>
          <p className="browse-hub-page-subtitle mt-1 text-gray-500">{copy.subtitle}</p>
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
