import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { BRAND_GREEN } from "../lib/brand";
import { localizeCategoryLabel } from "../lib/i18n/categoryLabels";
import { useMessages } from "../lib/i18n/react";
import { getCategoryCatalog, type CategoryCatalogEntry } from "../lib/homeCategoryPicks";
import type { SubcategoryItem } from "../screens/listing/listingItemCategories";

const GREEN = BRAND_GREEN;
const BORDER = "#E8E6E0";

function SubList({ items }: { items: SubcategoryItem[] }) {
  return (
    <ul className="grid grid-cols-1 gap-y-0.5 sm:grid-cols-2 sm:gap-x-3">
      {items.map((item) => (
        <li
          key={item.label}
          className="flex min-w-0 items-start gap-2 py-1.5 text-[16px] leading-snug text-gray-800"
        >
          <span className="mt-0.5 w-5 shrink-0 text-center text-[17px]" aria-hidden>
            {item.emoji}
          </span>
          <span className="min-w-0 font-medium [overflow-wrap:anywhere]">
            {localizeCategoryLabel(item.label)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function CategoryExpandRow({
  entry,
  open,
  onToggle,
  householdLabel,
  proLabel,
}: {
  entry: CategoryCatalogEntry;
  open: boolean;
  onToggle: () => void;
  householdLabel: string;
  proLabel: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: BORDER }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 px-3.5 py-3.5 text-left active:bg-[#F7FBF8]"
      >
        <span className="text-[22px]" aria-hidden>
          {entry.icon}
        </span>
        <span className="min-w-0 flex-1 text-[17px] font-bold leading-snug text-gray-900">
          {localizeCategoryLabel(entry.name)}
        </span>
        <span className="shrink-0 text-[14px] font-semibold text-gray-400">
          {entry.personal.length + entry.professional.length}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          style={{ color: GREEN }}
        />
      </button>

      {open ? (
        <div className="space-y-4 border-t px-3.5 pb-4 pt-3.5" style={{ borderColor: BORDER }}>
          {entry.personal.length > 0 ? (
            <div>
              <p className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-gray-500">
                {householdLabel}
              </p>
              <SubList items={entry.personal} />
            </div>
          ) : null}
          {entry.professional.length > 0 ? (
            <div>
              <p className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-gray-500">
                {proLabel}
              </p>
              <SubList items={entry.professional} />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

type Props = {
  hint?: string;
  /** When true, opens the first category on mount. Default off so the full list stays visible. */
  defaultOpenFirst?: boolean;
};

export function CategoryCatalogExplorer({ hint, defaultOpenFirst = false }: Props) {
  const t = useMessages();
  const catalog = getCategoryCatalog();
  const [openName, setOpenName] = useState<string | null>(() =>
    defaultOpenFirst && catalog[0] ? catalog[0].name : null,
  );
  const resolvedHint = hint ?? t.catalog.explorerHint;

  return (
    <div>
      <p className="text-[15px] leading-snug text-gray-600">{resolvedHint}</p>
      <div className="mt-3 flex flex-col gap-2.5">
        {catalog.map((entry) => (
          <CategoryExpandRow
            key={entry.name}
            entry={entry}
            open={openName === entry.name}
            onToggle={() => setOpenName((cur) => (cur === entry.name ? null : entry.name))}
            householdLabel={t.catalog.household}
            proLabel={t.catalog.pro}
          />
        ))}
      </div>
    </div>
  );
}
