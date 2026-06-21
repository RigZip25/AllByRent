import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { BRAND_AMBER, BRAND_GREEN, MASCOT_NAME, ONBOARDING } from "../lib/brand";
import {
  GARAGE_SALE_OPEN_OPTIONS,
  garageSaleOpenLabel,
  getGarageSaleOpenWindow,
  setGarageSaleOpenWindow,
  type GarageSaleOpenWindow,
} from "../lib/garageSaleStorage";
import { onboardingAssets } from "../lib/onboardingAssets";

const GREEN = BRAND_GREEN;
const AMBER = BRAND_AMBER;
const BORDER = "#E8E6E0";

const { openGarageSale: copy } = ONBOARDING;

type OpenGarageSaleScreenProps = {
  onBack: () => void;
  onAddSaleItems: () => void;
  onOpenMyGarage: () => void;
};

export function OpenGarageSaleScreen({
  onBack,
  onAddSaleItems,
  onOpenMyGarage,
}: OpenGarageSaleScreenProps) {
  const [openWindow, setOpenWindow] = useState<GarageSaleOpenWindow>(() => getGarageSaleOpenWindow());

  const pickWindow = (window: GarageSaleOpenWindow) => {
    setOpenWindow(window);
    setGarageSaleOpenWindow(window);
  };

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#FFF9F0]">
      <div className="shrink-0 border-b px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))]" style={{ borderColor: `${AMBER}44` }}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full border bg-white active:bg-gray-50"
            style={{ borderColor: BORDER }}
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" style={{ color: GREEN }} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold" style={{ color: GREEN }}>
              {copy.title}
            </h1>
            <p className="text-[13px] text-gray-600">{copy.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="screen-scroll flex flex-1 flex-col px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
        <div className="flex justify-center py-2">
          <img
            src={onboardingAssets.stockGarage}
            alt=""
            className="max-h-[clamp(120px,22dvh,180px)] w-full max-w-[280px] object-contain"
            draggable={false}
          />
        </div>

        <section className="mt-2 rounded-2xl border bg-white p-4" style={{ borderColor: `${AMBER}55` }}>
          <h2 className="text-base font-bold text-gray-900">{copy.hoursTitle}</h2>
          <p className="mt-1 text-sm text-gray-500">{copy.hoursHint}</p>
          <div className="mt-3 flex flex-col gap-2">
            {GARAGE_SALE_OPEN_OPTIONS.map((option) => {
              const selected = openWindow === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => pickWindow(option.id)}
                  className="flex items-center justify-between rounded-xl border px-3 py-3 text-left transition-colors"
                  style={{
                    borderColor: selected ? AMBER : BORDER,
                    backgroundColor: selected ? `${AMBER}18` : "#fff",
                  }}
                >
                  <span className="text-[15px] font-semibold text-gray-900">{option.label}</span>
                  <span className="text-sm text-gray-500">{option.hours}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs font-medium" style={{ color: "#92400E" }}>
            Neighbors will see: {garageSaleOpenLabel(openWindow)}
          </p>
        </section>

        <section className="mt-4 rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
          <h2 className="text-base font-bold text-gray-900">{copy.shelfTitle}</h2>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">{copy.shelfHint}</p>
          <div
            className="mt-3 rounded-xl px-3 py-2 text-sm font-medium"
            style={{ backgroundColor: `${GREEN}10`, color: GREEN }}
          >
            {copy.shelfNote}
          </div>
          <button
            type="button"
            onClick={onAddSaleItems}
            className="mt-4 w-full rounded-xl py-3.5 text-base font-bold text-white active:opacity-90"
            style={{ backgroundColor: AMBER, color: GREEN }}
          >
            {copy.addItemsCta}
          </button>
        </section>

        <button
          type="button"
          onClick={onOpenMyGarage}
          className="mt-4 w-full rounded-xl border-2 py-3 text-base font-bold active:opacity-90"
          style={{ borderColor: GREEN, color: GREEN }}
        >
          {copy.myGarageCta}
        </button>

        <p className="mt-4 text-center text-xs text-gray-500">
          {MASCOT_NAME} {copy.mascotHint}
        </p>
      </div>
    </div>
  );
}
