import { ChevronRight } from "lucide-react";
import { BRAND_AMBER, BRAND_GREEN } from "../lib/brand";

const GREEN = BRAND_GREEN;
const AMBER = BRAND_AMBER;

export type HubChoiceVariant = "primary" | "yardSale" | "outline";

type HubChoiceCardProps = {
  imageSrc: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  variant: HubChoiceVariant;
  badge?: string;
  onClick: () => void;
};

export function HubChoiceCard({
  imageSrc,
  title,
  subtitle,
  ctaLabel,
  variant,
  badge,
  onClick,
}: HubChoiceCardProps) {
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
        <img src={imageSrc} alt="" className="browse-hub-choice-illustration" draggable={false} />
        {badge ? (
          <span className="browse-hub-choice-badge" aria-hidden>
            {badge}
          </span>
        ) : null}
      </div>
      <div className="browse-hub-choice-body min-h-0 shrink px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3">
        <div className="flex min-h-0 items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="browse-hub-choice-title font-bold" style={{ color: GREEN }}>
              {title}
            </h2>
            <p className="browse-hub-choice-subtitle mt-0.5 text-gray-500">{subtitle}</p>
          </div>
          <ChevronRight
            className="mt-0.5 h-5 w-5 shrink-0 text-gray-300"
            strokeWidth={2.5}
            aria-hidden
          />
        </div>
        <span
          className="browse-hub-choice-cta mt-2.5 flex w-full items-center justify-center rounded-xl py-2 font-bold sm:mt-3 sm:py-2.5"
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
