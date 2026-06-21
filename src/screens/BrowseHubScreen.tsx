import { MapPin } from "lucide-react";
import { BRAND_AMBER, BRAND_GREEN, ONBOARDING } from "../lib/brand";
import { clusterLabelForCity, getClusterRadiusMi } from "../lib/clusterConfig";
import { getActiveRentLocationLabel, hasRentLocationSetup } from "../lib/listingStorage";

const GREEN = BRAND_GREEN;
const AMBER = BRAND_AMBER;
const BORDER = "#E8E6E0";

const { browseHub: copy } = ONBOARDING;

type HubChoice = "findGear" | "yardSales" | "stockGarage";

type BrowseHubScreenProps = {
  onChoose: (choice: HubChoice) => void;
  onEditLocation: () => void;
};

function HubCard({
  title,
  subtitle,
  ctaLabel,
  emoji,
  variant,
  onClick,
}: {
  title: string;
  subtitle: string;
  ctaLabel: string;
  emoji: string;
  variant: "green" | "amber" | "neutral";
  onClick: () => void;
}) {
  const isAmber = variant === "amber";
  const isGreen = variant === "green";

  return (
    <button
      type="button"
      onClick={onClick}
      className="browse-hub-card flex w-full flex-col overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition-opacity active:opacity-90"
      style={{ borderColor: isAmber ? `${AMBER}66` : BORDER }}
    >
      <div
        className="browse-hub-card-art flex items-center justify-center rounded-t-2xl"
        style={{
          backgroundColor: isAmber ? `${AMBER}18` : isGreen ? `${GREEN}12` : "#F3F4F6",
        }}
      >
        <span className="text-5xl" aria-hidden>
          {emoji}
        </span>
      </div>
      <div className="browse-hub-card-body px-4 pb-4 pt-3 text-center sm:px-5 sm:pb-5 sm:pt-4">
        <h2 className="text-lg font-bold" style={{ color: GREEN }}>
          {title}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">{subtitle}</p>
        <span
          className="mt-3 flex w-full items-center justify-center rounded-xl py-2.5 text-base font-bold sm:mt-4 sm:py-3"
          style={
            isAmber
              ? { backgroundColor: AMBER, color: GREEN }
              : isGreen
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
    <div className="screen onboarding-step mx-auto w-full max-w-[390px] bg-[#F0F4F2]">
      <div className="shrink-0 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top,0px))]">
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
            className="min-w-0 flex-1 break-words text-[16px] font-bold leading-snug [overflow-wrap:anywhere]"
            style={{ color: needsLocation ? "#B45309" : GREEN }}
          >
            {clusterLabel}
          </span>
        </button>

        <div className="text-center">
          <h1 className="text-2xl font-bold" style={{ color: GREEN }}>
            {copy.title}
          </h1>
          <p className="mt-1 text-base text-gray-500">{copy.subtitle}</p>
        </div>
      </div>

      <div className="browse-hub-cards screen-scroll flex flex-col gap-3 px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
        <HubCard
          variant="green"
          emoji="🔍"
          title={copy.findGear.title}
          subtitle={copy.findGear.subtitle}
          ctaLabel={copy.findGear.cta}
          onClick={() => onChoose("findGear")}
        />
        <HubCard
          variant="amber"
          emoji="🏷️"
          title={copy.yardSales.title}
          subtitle={copy.yardSales.subtitle}
          ctaLabel={copy.yardSales.cta}
          onClick={() => onChoose("yardSales")}
        />
        <HubCard
          variant="neutral"
          emoji="🛠️"
          title={copy.stockGarage.title}
          subtitle={copy.stockGarage.subtitle}
          ctaLabel={copy.stockGarage.cta}
          onClick={() => onChoose("stockGarage")}
        />
        <p className="pb-1 text-center text-xs text-gray-400">{copy.footer}</p>
      </div>
    </div>
  );
}
