import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { BRAND_GREEN } from "../lib/brand";
import { getCategoryCatalog, type CategoryCatalogEntry } from "../lib/homeCategoryPicks";
import type { SubcategoryItem } from "../screens/listing/listingItemCategories";

const GREEN = BRAND_GREEN;
const BORDER = "#E8E6E0";

function SubChip({ item }: { item: SubcategoryItem }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border bg-white px-2 py-1 text-[11px] font-medium text-gray-700"
      style={{ borderColor: BORDER }}
    >
      <span aria-hidden>{item.emoji}</span>
      <span className="max-w-[9.5rem] truncate">{item.label}</span>
    </span>
  );
}

function CategoryExpandRow({
  entry,
  open,
  onToggle,
}: {
  entry: CategoryCatalogEntry;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: BORDER }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left active:bg-[#F7FBF8]"
      >
        <span className="text-[18px]" aria-hidden>
          {entry.icon}
        </span>
        <span className="min-w-0 flex-1 text-[13px] font-bold text-gray-900">{entry.name}</span>
        <span className="shrink-0 text-[11px] font-medium text-gray-400">
          {entry.personal.length + entry.professional.length}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          style={{ color: GREEN }}
        />
      </button>

      {open ? (
        <div className="space-y-3 border-t px-3 pb-3 pt-2.5" style={{ borderColor: BORDER }}>
          {entry.personal.length > 0 ? (
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Household
              </p>
              <div className="flex flex-wrap gap-1.5">
                {entry.personal.map((item) => (
                  <SubChip key={`p-${item.label}`} item={item} />
                ))}
              </div>
            </div>
          ) : null}
          {entry.professional.length > 0 ? (
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Pro / business
              </p>
              <div className="flex flex-wrap gap-1.5">
                {entry.professional.map((item) => (
                  <SubChip key={`pro-${item.label}`} item={item} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

type Props = {
  /** Hint under the section title. */
  hint?: string;
  /** Open the first category by default so the pattern is obvious. */
  defaultOpenFirst?: boolean;
};

export function CategoryCatalogExplorer({
  hint = "Tap a category to see what’s inside — household and pro shelves.",
  defaultOpenFirst = true,
}: Props) {
  const catalog = getCategoryCatalog();
  const [openName, setOpenName] = useState<string | null>(() =>
    defaultOpenFirst && catalog[0] ? catalog[0].name : null,
  );

  return (
    <div>
      <p className="text-[13px] leading-snug text-gray-500">{hint}</p>
      <div className="mt-3 flex flex-col gap-2">
        {catalog.map((entry) => (
          <CategoryExpandRow
            key={entry.name}
            entry={entry}
            open={openName === entry.name}
            onToggle={() => setOpenName((cur) => (cur === entry.name ? null : entry.name))}
          />
        ))}
      </div>
    </div>
  );
}
