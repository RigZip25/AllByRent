import { useState } from "react";
import { ChevronDown, Shield } from "lucide-react";
import { useMessages } from "../lib/i18n/react";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

type Props = {
  category: string;
  /** When set, prefers subcategory industry tip over the category-level card. */
  subcategory?: string;
  /** When true, expand details by default (e.g. listing wizard). */
  defaultExpanded?: boolean;
  className?: string;
};

/** Category-scoped how-it-works / safety fact — not global FAQ. */
export function CategoryFactCard({
  category,
  subcategory,
  defaultExpanded = false,
  className = "",
}: Props) {
  const t = useMessages();
  const catKey = category.trim();
  const subKey = subcategory?.trim() ?? "";
  const subFact =
    subKey && t.categoryFacts.bySubcategory?.[catKey]
      ? t.categoryFacts.bySubcategory[catKey]?.[subKey]
      : undefined;
  const fact = subFact ?? t.categoryFacts.byCategory[catKey];
  const [open, setOpen] = useState(defaultExpanded);

  if (!fact) return null;

  return (
    <div
      className={`rounded-2xl border border-amber-200 bg-amber-50/80 px-3.5 py-3 ${className}`}
      data-category-fact={catKey}
      data-subcategory-fact={subKey || undefined}
    >
      <div className="flex items-start gap-2">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-amber-900" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-amber-950">{fact.title}</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-amber-900/90">
            {fact.summary}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-2.5 flex w-full items-center justify-between gap-2 rounded-xl border border-amber-200/80 bg-white/70 px-3 py-2 text-left"
      >
        <span className="text-[12px] font-semibold" style={{ color: GREEN }}>
          {open ? t.categoryFacts.collapse : t.categoryFacts.expand}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          style={{ color: GREEN }}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          className="mt-2.5 space-y-3 border-t border-amber-200/70 pt-2.5 text-[12.5px] leading-relaxed text-amber-950/95"
          style={{ borderColor: BORDER }}
        >
          {fact.hostTipTitle && fact.hostTip ? (
            <div>
              <p className="font-semibold text-amber-950">{fact.hostTipTitle}</p>
              <p className="mt-1 text-amber-900/90">{fact.hostTip}</p>
              {fact.hostTipLinkHref && fact.hostTipLinkLabel ? (
                <a
                  href={fact.hostTipLinkHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-block text-[12.5px] font-semibold underline underline-offset-2"
                  style={{ color: GREEN }}
                >
                  {fact.hostTipLinkLabel}
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
        </div>
      ) : null}
    </div>
  );
}
