import { MapPin } from "lucide-react";
import { HubChoiceCard } from "../components/HubChoiceCard";
import { BRAND_AMBER, BRAND_GREEN } from "../lib/brand";
import { clusterLabelForCity, getClusterRadiusMi } from "../lib/clusterConfig";
import { getAllCategoryChips } from "../lib/homeCategoryPicks";
import { getActiveRentLocationLabel, hasRentLocationSetup } from "../lib/listingStorage";
import { onboardingAssets } from "../lib/onboardingAssets";
import { localizeCategoryLabel } from "../lib/i18n/categoryLabels";
import { useMessages, useOnboardingCopy } from "../lib/i18n/react";

const GREEN = BRAND_GREEN;
const AMBER = BRAND_AMBER;
const BORDER = "#E8E6E0";

export type BrowseHubChoice = "findGear" | "yardSales";

type BrowseHubScreenProps = {
  onChoose: (choice: BrowseHubChoice) => void;
  onChooseCategory: (category: string) => void;
  onEditLocation: () => void;
};

export function BrowseHubScreen({
  onChoose,
  onChooseCategory,
  onEditLocation,
}: BrowseHubScreenProps) {
  const { browseHub: copy } = useOnboardingCopy();
  const { home } = useMessages();
  const city = getActiveRentLocationLabel().trim();
  const clusterLabel = clusterLabelForCity(city, getClusterRadiusMi());
  const needsLocation = !hasRentLocationSetup();
  const categories = getAllCategoryChips();

  return (
    <div className="screen onboarding-step mx-auto w-full max-w-[390px] bg-white">
      <div className="browse-hub-header shrink-0 px-4 pb-2 pt-[max(1.25rem,calc(env(safe-area-inset-top,0px)+0.75rem))]">
        <button
          type="button"
          onClick={onEditLocation}
          className="mb-3 flex min-w-0 items-start gap-1.5 text-left"
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
            className="min-w-0 flex-1 break-words text-base font-semibold leading-snug [overflow-wrap:anywhere]"
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
          badge="BETA"
          onClick={() => onChoose("yardSales")}
        />
      </div>

      <section
        className="browse-hub-categories shrink-0 px-4 pb-2 pt-1"
        aria-label={copy.categoriesTitle}
      >
        <p className="text-[12px] font-semibold uppercase tracking-wide text-gray-400">
          {copy.categoriesTitle}
        </p>
        <p className="mt-0.5 text-[12px] leading-snug text-gray-500">{copy.categoriesHint}</p>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => onChooseCategory(cat.name)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-white px-3 py-2 text-[13px] font-semibold active:bg-[#F9FAFB]"
              style={{ borderColor: BORDER, color: GREEN }}
            >
              <span aria-hidden>{cat.icon}</span>
              {localizeCategoryLabel(cat.name)}
            </button>
          ))}
        </div>
      </section>

      <p className="browse-hub-footer shrink-0 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] text-center text-sm text-gray-500">
        {copy.footer}
      </p>
    </div>
  );
}
