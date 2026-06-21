import { ArrowLeft, MapPin } from "lucide-react";
import { HubChoiceCard } from "../components/HubChoiceCard";
import { BRAND_AMBER, BRAND_GREEN, ONBOARDING } from "../lib/brand";
import { clusterLabelForCity, getClusterRadiusMi } from "../lib/clusterConfig";
import { getActiveRentLocationLabel, hasRentLocationSetup } from "../lib/listingStorage";
import { onboardingAssets } from "../lib/onboardingAssets";

const GREEN = BRAND_GREEN;
const AMBER = BRAND_AMBER;
const BORDER = "#E8E6E0";

const { yardSaleHub: copy } = ONBOARDING;

export type YardSaleHubChoice = "browse" | "host";

type YardSaleHubScreenProps = {
  onBack: () => void;
  onChoose: (choice: YardSaleHubChoice) => void;
  onEditLocation: () => void;
};

export function YardSaleHubScreen({ onBack, onChoose, onEditLocation }: YardSaleHubScreenProps) {
  const city = getActiveRentLocationLabel().trim();
  const clusterLabel = clusterLabelForCity(city, getClusterRadiusMi());
  const needsLocation = !hasRentLocationSetup();

  return (
    <div className="screen onboarding-step mx-auto w-full max-w-[390px] bg-[#FFF9F0]">
      <div className="browse-hub-header shrink-0 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top,0px))]">
        <div className="mb-3 flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full border bg-white active:bg-gray-50"
            style={{ borderColor: BORDER }}
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" style={{ color: GREEN }} />
          </button>
          <button
            type="button"
            onClick={onEditLocation}
            className="flex min-w-0 flex-1 items-start gap-1.5 text-left"
          >
            <MapPin
              className="mt-0.5 h-4 w-4 shrink-0"
              style={{ color: needsLocation ? AMBER : GREEN }}
              fill={needsLocation ? AMBER : GREEN}
            />
            <span
              className="min-w-0 flex-1 text-[14px] font-semibold leading-snug [overflow-wrap:anywhere]"
              style={{ color: needsLocation ? "#B45309" : GREEN }}
            >
              {clusterLabel}
            </span>
          </button>
        </div>

        <div className="text-center">
          <h1 className="browse-hub-page-title font-bold tracking-tight" style={{ color: GREEN }}>
            {copy.title}
          </h1>
          <p className="browse-hub-page-subtitle mt-1 text-gray-600">{copy.subtitle}</p>
        </div>
      </div>

      <div className="browse-hub-cards browse-hub-cards--duo">
        <HubChoiceCard
          variant="yardSale"
          imageSrc={onboardingAssets.onBlock}
          title={copy.browse.title}
          subtitle={copy.browse.subtitle}
          ctaLabel={copy.browse.cta}
          badge="OPEN"
          onClick={() => onChoose("browse")}
        />
        <HubChoiceCard
          variant="outline"
          imageSrc={onboardingAssets.stockGarage}
          title={copy.host.title}
          subtitle={copy.host.subtitle}
          ctaLabel={copy.host.cta}
          onClick={() => onChoose("host")}
        />
      </div>

      <p className="browse-hub-footer shrink-0 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] text-center text-xs text-amber-900/60">
        {copy.footer}
      </p>
    </div>
  );
}
