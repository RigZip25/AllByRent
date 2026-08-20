import { useState } from "react";
import { ChevronDown, Shield } from "lucide-react";
import { useMessages } from "../lib/i18n/react";
import { listingIsSemiOrCommercialTrailer } from "../lib/listingRentRules";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

type FactBlock = {
  title: string;
  summary: string;
  hostTipTitle?: string;
  hostTip?: string;
  hostTipLinkLabel?: string;
  hostTipLinkHref?: string;
  whyGeoTitle: string;
  whyGeo: string;
  contactlessTitle?: string;
  contactless?: string;
  flowTitle: string;
  flow: string;
  layersTitle: string;
  layers: string;
  claimsTitle: string;
  claims: string;
};

type Props = {
  category: string;
  subcategory?: string;
  /**
   * Prefer commercial / ≥26k / semi fact copy when present
   * (VehiclesCommercial). Also auto-detected for Commercial Trucks /
   * Equipment Trailers / Tow Vehicles / semi shelves.
   */
  commercialTransport?: boolean;
  /** Prefer collapsed — long instruction bodies stay behind the chevron. */
  defaultExpanded?: boolean;
  className?: string;
};

export function CategoryFactCard({
  category,
  subcategory,
  commercialTransport = false,
  defaultExpanded = false,
  className = "",
}: Props) {
  const t = useMessages();
  const catKey = category.trim();
  const subKeyName = subcategory?.trim() ?? "";
  const shelfCommercial =
    catKey === "Vehicles" &&
    (commercialTransport ||
      listingIsSemiOrCommercialTrailer({
        category: catKey,
        subcategory: subKeyName,
        categorySpecs: {},
      }));
  const subFact =
    subKeyName && t.categoryFacts.bySubcategory?.[catKey]
      ? (t.categoryFacts.bySubcategory[catKey]?.[subKeyName] as FactBlock | undefined)
      : undefined;
  const commercialFact = shelfCommercial
    ? (t.categoryFacts.byCategory.VehiclesCommercial as FactBlock | undefined)
    : undefined;
  const baseFact = t.categoryFacts.byCategory[catKey] as FactBlock | undefined;
  // Commercial shelves must never fall through to the light Vehicles FAQ.
  const fact = shelfCommercial
    ? commercialFact
    : (subFact ?? baseFact);
  const [open, setOpen] = useState(defaultExpanded);
  if (!fact) return null;

  const tipHref = fact.hostTipLinkHref?.trim();
  const tipLabel = fact.hostTipLinkLabel?.trim();
  // Soft optional link only — never hard-sell partner products in the collapsed card.
  const showTipLink = Boolean(tipHref && tipLabel);

  return (
    <div
      className={`rounded-2xl border border-amber-200 bg-amber-50/80 px-3.5 py-3 ${className}`}
      data-category-fact={catKey}
      data-subcategory-fact={subKeyName || undefined}
      data-commercial-fact={shelfCommercial ? "true" : undefined}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start gap-2 text-left"
      >
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-amber-900" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-amber-950">{fact.title}</p>
          {!open ? (
            <p className="mt-1 text-[12px] font-medium" style={{ color: GREEN }}>
              {t.categoryFacts.expand}
            </p>
          ) : null}
        </div>
        <ChevronDown
          className={`mt-0.5 h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          style={{ color: GREEN }}
          aria-hidden
        />
      </button>
      {open ? (
        <div
          className="mt-2.5 space-y-3 border-t border-amber-200/70 pt-2.5 text-[12.5px] leading-relaxed text-amber-950/95"
          style={{ borderColor: BORDER }}
        >
          <p className="text-amber-900/90">{fact.summary}</p>
          {fact.hostTipTitle && fact.hostTip ? (
            <div>
              <p className="font-semibold text-amber-950">{fact.hostTipTitle}</p>
              <p className="mt-1 text-amber-900/90">{fact.hostTip}</p>
              {showTipLink ? (
                <a
                  href={tipHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-block text-[12px] font-medium underline underline-offset-2"
                  style={{ color: GREEN }}
                >
                  {tipLabel}
                </a>
              ) : null}
            </div>
          ) : null}
          <div>
            <p className="font-semibold text-amber-950">{fact.whyGeoTitle}</p>
            <p className="mt-1 text-amber-900/90">{fact.whyGeo}</p>
          </div>
          {fact.contactlessTitle && fact.contactless ? (
            <div>
              <p className="font-semibold text-amber-950">{fact.contactlessTitle}</p>
              <p className="mt-1 text-amber-900/90">{fact.contactless}</p>
            </div>
          ) : null}
          <div>
            <p className="font-semibold text-amber-950">{fact.flowTitle}</p>
            <p className="mt-1 text-amber-900/90">{fact.flow}</p>
          </div>
          <div>
            <p className="font-semibold text-amber-950">{fact.layersTitle}</p>
            <p className="mt-1 text-amber-900/90">{fact.layers}</p>
          </div>
          <div>
            <p className="font-semibold text-amber-950">{fact.claimsTitle}</p>
            <p className="mt-1 text-amber-900/90">{fact.claims}</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex w-full items-center justify-between gap-2 rounded-xl border border-amber-200/80 bg-white/70 px-3 py-2 text-left"
          >
            <span className="text-[12px] font-semibold" style={{ color: GREEN }}>
              {t.categoryFacts.collapse}
            </span>
            <ChevronDown
              className="h-4 w-4 shrink-0 rotate-180"
              style={{ color: GREEN }}
              aria-hidden
            />
          </button>
        </div>
      ) : null}
    </div>
  );
}
