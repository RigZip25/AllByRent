import { useMessages } from "../lib/i18n/react";
import { ArrowLeft } from "lucide-react";
import { HubChoiceCard } from "../components/HubChoiceCard";
import { LocationAreaControls } from "../components/LocationAreaControls";
import { BRAND_GREEN } from "../lib/brand";
import { onboardingAssets } from "../lib/onboardingAssets";

const GREEN = BRAND_GREEN;
const BORDER = "#E8E6E0";

export type YardSaleHubChoice = "browse" | "host";

type YardSaleHubScreenProps = {
  onBack: () => void;
  onChoose: (choice: YardSaleHubChoice) => void;
};

export function YardSaleHubScreen({ onBack, onChoose }: YardSaleHubScreenProps) {
  const { garageSale, common } = useMessages();
  const copy = garageSale.yardSaleHub;

  return (
    <div className="screen onboarding-step mx-auto w-full max-w-[390px] bg-[#FFF9F0]">
      <div className="browse-hub-header shrink-0 px-4 pb-3 pt-[max(1rem,calc(env(safe-area-inset-top,0px)+0.5rem))]">
        <div className="relative mb-3 flex min-h-10 items-center justify-center">
          <button
            type="button"
            onClick={onBack}
            className="absolute left-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-white active:bg-gray-50"
            style={{ borderColor: BORDER }}
            aria-label={common.back}
          >
            <ArrowLeft className="h-5 w-5" style={{ color: GREEN }} />
          </button>
          <h1 className="browse-hub-page-title px-12 text-center font-bold tracking-tight" style={{ color: GREEN }}>
            {copy.title}
          </h1>
        </div>

        <p className="browse-hub-page-subtitle mb-3 text-center text-gray-600">{copy.subtitle}</p>

        <LocationAreaControls variant="compact" />
      </div>

      <div className="browse-hub-cards browse-hub-cards--duo">
        <HubChoiceCard
          variant="yardSale"
          imageSrc={onboardingAssets.onBlock}
          title={copy.browse.title}
          subtitle={copy.browse.subtitle}
          ctaLabel={copy.browse.cta}
          badge={copy.openBadge}
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
