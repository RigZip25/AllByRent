/**
 * Category / subcategory rental FAQ card.
 *
 * Evorios standard: Question → short answer only (`qa: [{ q, a }]`).
 * Collapsed by default. See docs/CATEGORY_FACT_QA.md.
 */
import { useState } from "react";
import { ChevronDown, Shield } from "lucide-react";
import { useMessages } from "../lib/i18n/react";
import { listingIsSemiOrCommercialTrailer } from "../lib/listingRentRules";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

/** Subcategory FAQs that stay on the commercial path (not light-car copy). */
const VEHICLES_COMMERCIAL_SUB_FACTS = new Set([
  "Commercial Trucks",
  "Equipment Trailers",
  "Tow Vehicles",
]);

type FactQa = { q: string; a: string };

type FactBlock = {
  title: string;
  summary: string;
  /** Canonical FAQ: one clear question + 1–2 sentence answer each. */
  qa?: FactQa[];
  /** @deprecated Prefer `qa`. Legacy essay fallback only. */
  hostTipTitle?: string;
  hostTip?: string;
  hostTipLinkLabel?: string;
  hostTipLinkHref?: string;
  whyGeoTitle?: string;
  whyGeo?: string;
  contactlessTitle?: string;
  contactless?: string;
  flowTitle?: string;
  flow?: string;
  layersTitle?: string;
  layers?: string;
  claimsTitle?: string;
  claims?: string;
};

type Props = {
  category: string;
  subcategory?: string;
  /**
   * Prefer commercial / ≥26k / semi fact copy when present
   * (VehiclesCommercial). Also auto-detected for Commercial Trucks /
   * Equipment Trailers / Tow Vehicles / semi shelves — unless that
   * subcategory has its own FactCard.
   */
  commercialTransport?: boolean;
  /** Prefer collapsed — long instruction bodies stay behind the chevron. */
  defaultExpanded?: boolean;
  className?: string;
};

function EssaySection({ title, body }: { title?: string; body?: string }) {
  if (!title?.trim() || !body?.trim()) return null;
  return (
    <div>
      <p className="font-semibold text-amber-950">{title}</p>
      <p className="mt-1 text-amber-900/90">{body}</p>
    </div>
  );
}

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
  // Commercial ≥26k / semi: never show light-car subcategory FAQ.
  // Tow / Equipment Trailers / Commercial Trucks may use their own Q&A.
  // Non-commercial: subcategory (moto, trailers, cars) then category base.
  const commercialSubFact =
    shelfCommercial &&
    subKeyName &&
    VEHICLES_COMMERCIAL_SUB_FACTS.has(subKeyName)
      ? subFact
      : undefined;
  const fact = shelfCommercial
    ? (commercialSubFact ?? commercialFact)
    : (subFact ?? baseFact);
  const [open, setOpen] = useState(defaultExpanded);
  if (!fact) return null;

  const tipHref = fact.hostTipLinkHref?.trim();
  const tipLabel = fact.hostTipLinkLabel?.trim();
  // Soft optional link only — never hard-sell partner products in the collapsed card.
  const showTipLink = Boolean(tipHref && tipLabel);
  const qa =
    fact.qa?.filter((item) => {
      const q = item.q?.trim() ?? "";
      const a = item.a?.trim() ?? "";
      if (!q || !a) return false;
      // Encode-agent junk — never show to hosts.
      if (/partner\s*promo/i.test(q)) return false;
      if (/hard-sell|affiliate hard-sell/i.test(a) && /no\b/i.test(a)) return false;
      return true;
    }) ?? [];
  const useQa = qa.length > 0;

  const sanitizeFactText = (raw: string): string => {
    let s = raw;
    s = s.replace(/\bWhat gates apply\?/gi, "What should I fill in?");
    s = s.replace(/\bWhat must be listed\?/gi, "What should I list?");
    s = s.replace(/\bkitIncludes\b/g, "what's included");
    // Strip bare camelCase field tokens left in answers (encode leftovers).
    s = s.replace(/\b[a-z]+[A-Z][a-zA-Z0-9]*\b/g, (token) => {
      const known = /^(kit|device|person|season|snow|water|sports|power|tool|drill|use|transport|unique|cargo|special|tow|vehicles|eBike|adaptive|scooter|bikes|captain|boats|hand|structural|construction|house|liability)/;
      if (!known.test(token)) return token;
      return token.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toLowerCase()).trim();
    });
    s = s.replace(/\bRent freezes\b/gi, "List");
    s = s.replace(/\bfreezes\b/gi, "records");
    s = s.replace(/\bfreeze\b/gi, "record");
    return s;
  };

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
          <p className="text-[13px] font-semibold text-amber-950">
            {sanitizeFactText(fact.title)}
          </p>
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
          {useQa ? (
            <>
              {fact.summary.trim() ? (
                <p className="text-amber-900/90">{sanitizeFactText(fact.summary)}</p>
              ) : null}
              <ul className="space-y-2.5">
                {qa.map((item) => (
                  <li key={item.q}>
                    <p className="font-semibold text-amber-950">{sanitizeFactText(item.q)}</p>
                    <p className="mt-0.5 text-amber-900/90">{sanitizeFactText(item.a)}</p>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
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
              <EssaySection title={fact.whyGeoTitle} body={fact.whyGeo} />
              <EssaySection title={fact.contactlessTitle} body={fact.contactless} />
              <EssaySection title={fact.flowTitle} body={fact.flow} />
              <EssaySection title={fact.layersTitle} body={fact.layers} />
              <EssaySection title={fact.claimsTitle} body={fact.claims} />
            </>
          )}
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
