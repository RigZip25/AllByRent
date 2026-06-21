import { ChevronRight, MapPin } from "lucide-react";
import { BRAND_AMBER, BRAND_GREEN, ONBOARDING } from "../lib/brand";
import { clusterLabelForCity, getClusterRadiusMi } from "../lib/clusterConfig";
import { getActiveRentLocationLabel, hasRentLocationSetup } from "../lib/listingStorage";
import { onboardingAssets } from "../lib/onboardingAssets";

const GREEN = BRAND_GREEN;
const AMBER = BRAND_AMBER;

const { browseHub: copy } = ONBOARDING;

type HubChoice = "findGear" | "yardSales" | "stockGarage";

type BrowseHubScreenProps = {
  onChoose: (choice: HubChoice) => void;
  onEditLocation: () => void;
};

type HubCardProps = {
  imageSrc: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  variant: "primary" | "yardSale" | "outline";
  badge?: string;
  onClick: () => void;
};

function HubCard({
  imageSrc,
  title,
  subtitle,
  ctaLabel,
  variant,
  badge,
  onClick,
}: HubCardProps) {
  const isYardSale = variant === "yardSale";
  const isPrimary = variant === "primary";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`browse-hub-choice flex w-full min-h-0 flex-col overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition-transform active:scale-[0.99] ${
        isYardSale ? "browse-hub-choice--yard-sale" : ""
      }`}
    >
      <div className="browse-hub-choice-art rounded-t-2xl">
        <img
          src={imageSrc}
          alt=""
          className="browse-hub-choice-illustration"
          draggable={false}
        />
        {badge ? (
          <span className="browse-hub-choice-badge" aria-hidden>
            {badge}
          </span>
        ) : null}
      </div>
      <div className="browse-hub-choice-body shrink-0 px-4 pb-4 pt-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="browse-hub-choice-title text-[17px] font-bold leading-snug" style={{ color: GREEN }}>
              {title}
            </h2>
            <p className="browse-hub-choice-subtitle mt-0.5 text-sm leading-snug text-gray-500">
              {subtitle}
            </p>
          </div>
          <ChevronRight
            className="mt-0.5 h-5 w-5 shrink-0 text-gray-300"
            strokeWidth={2.5}
            aria-hidden
          />
        </div>
        <span
          className="browse-hub-choice-cta mt-3 flex w-full items-center justify-center rounded-xl py-2.5 text-[15px] font-bold"
          style={
            isYardSale
              ? { backgroundColor: AMBER, color: GREEN }
              : isPrimary
                ? { backgroundColor: GREEN, color: "white" }
                : { border: `2px solid ${GREEN}`, color: GREEN }
          }
        >
          {ctaLabel}
        </span>
      </div>
    </button>
  );
}

export function BrowseHubScreen({ onChoose, onEditLocation }: BrowseHubScreenProps) {
  const city = getActiveRentLocationLabel().trim();
  const clusterLabel = clusterLabelForCity(city, getClusterRadiusMi());
  const needsLocation = !hasRentLocationSetup();

  return (
    <div className="screen onboarding-step mx-auto w-full max-w-[390px] bg-white">
      <div className="browse-hub-header shrink-0 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top,0px))]">
        <button
          type="button"
          onClick={onEditLocation}
          className="mb-3 flex min-w-0 items-start gap-1.5 text-left"
          aria-label={needsLocation ? "Set your block" : "Change block cluster"}
        >
          <MapPin
            className="mt-0.5 h-5 w-5 shrink-0"
            style={{ color: needsLocation ? AMBER : GREEN }}
            fill={needsLocation ? AMBER : GREEN}
            stroke={GREEN}
            strokeWidth={1.5}
          />
          <span
            className="min-w-0 flex-1 break-words text-[15px] font-semibold leading-snug [overflow-wrap:anywhere]"
            style={{ color: needsLocation ? "#B45309" : GREEN }}
          >
            {clusterLabel}
          </span>
        </button>

        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: GREEN }}>
            {copy.title}
          </h1>
          <p className="mt-1 text-[15px] text-gray-500">{copy.subtitle}</p>
        </div>
      </div>

      <div className="browse-hub-cards">
        <HubCard
          variant="primary"
          imageSrc={onboardingAssets.browseBlock}
          title={copy.findGear.title}
          subtitle={copy.findGear.subtitle}
          ctaLabel={copy.findGear.cta}
          onClick={() => onChoose("findGear")}
        />
        <HubCard
          variant="yardSale"
          imageSrc={onboardingAssets.onBlock}
          title={copy.yardSales.title}
          subtitle={copy.yardSales.subtitle}
          ctaLabel={copy.yardSales.cta}
          badge="OPEN"
          onClick={() => onChoose("yardSales")}
        />
        <HubCard
          variant="outline"
          imageSrc={onboardingAssets.stockGarage}
          title={copy.stockGarage.title}
          subtitle={copy.stockGarage.subtitle}
          ctaLabel={copy.stockGarage.cta}
          onClick={() => onChoose("stockGarage")}
        />
      </div>

      <p className="browse-hub-footer shrink-0 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] text-center text-xs text-gray-400">
        {copy.footer}
      </p>
    </div>
  );
}
