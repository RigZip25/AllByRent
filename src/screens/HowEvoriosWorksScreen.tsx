import { useState } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { APP_NAME, BRAND_AMBER, BRAND_GREEN, MASCOT_NAME } from "../lib/brand";
import { getAllCategoryChips } from "../lib/homeCategoryPicks";

const GREEN = BRAND_GREEN;
const AMBER = BRAND_AMBER;
const BORDER = "#E8E6E0";

type StepId = "idea" | "modes" | "navigate" | "categories";

const STEPS: { id: StepId; title: string; subtitle: string }[] = [
  { id: "idea", title: "The idea", subtitle: "Households as storefronts" },
  { id: "modes", title: "Rent · Sell · Gift", subtitle: "Three ways to share" },
  { id: "navigate", title: "Where to tap", subtitle: "Home, +, Garage, More" },
  { id: "categories", title: "Categories", subtitle: "What’s on the block" },
];

type Props = {
  onBack: () => void;
  onOpenBrowse?: () => void;
  onOpenStock?: () => void;
  onAskEvorios?: () => void;
};

export function HowEvoriosWorksScreen({
  onBack,
  onOpenBrowse,
  onOpenStock,
  onAskEvorios,
}: Props) {
  const [step, setStep] = useState(0);
  const current = STEPS[step]!;
  const categories = getAllCategoryChips();
  const isLast = step >= STEPS.length - 1;

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <header className="shrink-0 border-b bg-white px-4 pb-3 pt-3" style={{ borderColor: BORDER }}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" style={{ color: GREEN }} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[18px] font-extrabold" style={{ color: GREEN }}>
              How {APP_NAME} works
            </h1>
            <p className="text-[12px] text-gray-500">
              Step {step + 1} of {STEPS.length} · {current.subtitle}
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-1.5">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(i)}
              className="h-1.5 flex-1 rounded-full"
              style={{ backgroundColor: i <= step ? GREEN : "#D1D5DB" }}
              aria-label={s.title}
            />
          ))}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <h2 className="text-[22px] font-extrabold" style={{ color: GREEN }}>
          {current.title}
        </h2>

        {current.id === "idea" ? (
          <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-gray-700">
            <p>
              {APP_NAME} is a <strong>neighborhood marketplace</strong>. Each household is a{" "}
              <strong>business cell</strong> — your garage becomes an online storefront for the
              block.
            </p>
            <p>
              Neighbors browse nearby shelves. You stock tools, plants, cameras, party gear, and
              more — without building a separate shop for every item.
            </p>
            <div className="rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
              <p className="text-[13px] font-semibold text-gray-900">Remember</p>
              <p className="mt-1 text-[13px] text-gray-600">
                Same profile for browsing and hosting. Switch anytime between Browse and My Garage
                in Profile.
              </p>
            </div>
          </div>
        ) : null}

        {current.id === "modes" ? (
          <div className="mt-3 space-y-2">
            {[
              {
                title: "Rent",
                body: "Borrow for a day or week — or earn when someone borrows from your garage.",
              },
              {
                title: "Sell",
                body: "Buy from a neighbor’s shelf, or clear your own garage with priced listings.",
              },
              {
                title: "Gift",
                body: "Pass things along free — set Sell price to $0 when listing.",
              },
            ].map((row) => (
              <div
                key={row.title}
                className="rounded-2xl border bg-white px-4 py-3"
                style={{ borderColor: BORDER }}
              >
                <p className="text-[15px] font-bold" style={{ color: GREEN }}>
                  {row.title}
                </p>
                <p className="mt-1 text-[13px] leading-snug text-gray-600">{row.body}</p>
              </div>
            ))}
          </div>
        ) : null}

        {current.id === "navigate" ? (
          <div className="mt-3 space-y-2">
            {[
              {
                title: "Home",
                body: "Browse hub → category chips or “Browse the block”. Filter Rent / Buy on the feed. There is no search magnifier in the footer.",
              },
              {
                title: "Green + (Stock)",
                body: "List something from your garage — photos, category, rent and/or sell.",
              },
              {
                title: "Garage",
                body: "Your household storefront: listings, drafts, and host tools.",
              },
              {
                title: `More / ${MASCOT_NAME}`,
                body: `Account, rentals, favorites — and ${MASCOT_NAME} for FAQ + chat help.`,
              },
            ].map((row) => (
              <div
                key={row.title}
                className="rounded-2xl border bg-white px-4 py-3"
                style={{ borderColor: BORDER }}
              >
                <p className="text-[15px] font-bold" style={{ color: GREEN }}>
                  {row.title}
                </p>
                <p className="mt-1 text-[13px] leading-snug text-gray-600">{row.body}</p>
              </div>
            ))}
          </div>
        ) : null}

        {current.id === "categories" ? (
          <div className="mt-3">
            <p className="mb-3 text-[14px] leading-relaxed text-gray-600">
              Open Home → pick a category chip, or start browsing and filter on the feed. When you
              list with +, choose the same categories in the wizard.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <div
                  key={cat.name}
                  className="flex items-center gap-2 rounded-xl border bg-white px-2.5 py-2"
                  style={{ borderColor: BORDER }}
                >
                  <span aria-hidden>{cat.icon}</span>
                  <span className="min-w-0 truncate text-[12px] font-semibold text-gray-800">
                    {cat.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div
        className="shrink-0 space-y-2 border-t bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-3"
        style={{ borderColor: BORDER }}
      >
        {isLast ? (
          <>
            {onOpenBrowse ? (
              <button
                type="button"
                onClick={onOpenBrowse}
                className="flex w-full items-center justify-center gap-1 rounded-xl py-3.5 text-[15px] font-bold text-white"
                style={{ backgroundColor: GREEN }}
              >
                Browse the block
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : null}
            {onOpenStock ? (
              <button
                type="button"
                onClick={onOpenStock}
                className="w-full rounded-xl border-2 py-3 text-[15px] font-bold"
                style={{ borderColor: GREEN, color: GREEN }}
              >
                Stock my garage (+)
              </button>
            ) : null}
            {onAskEvorios ? (
              <button
                type="button"
                onClick={onAskEvorios}
                className="w-full py-2 text-center text-[13px] font-semibold underline"
                style={{ color: GREEN }}
              >
                Ask {MASCOT_NAME}
              </button>
            ) : null}
          </>
        ) : (
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))}
            className="flex w-full items-center justify-center gap-1 rounded-xl py-3.5 text-[15px] font-bold"
            style={{ backgroundColor: AMBER, color: GREEN }}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
        {step > 0 && !isLast ? (
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="w-full py-1 text-center text-[13px] font-medium text-gray-500"
          >
            Back
          </button>
        ) : null}
      </div>
    </div>
  );
}
