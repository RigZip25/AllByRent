import { useMemo, useState } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { CategoryCatalogExplorer } from "../components/CategoryCatalogExplorer";
import { APP_NAME, BRAND_AMBER, BRAND_GREEN, MASCOT_NAME } from "../lib/brand";
import { useMessages } from "../lib/i18n/react";

const GREEN = BRAND_GREEN;
const AMBER = BRAND_AMBER;
const BORDER = "#E8E6E0";

type StepId = "idea" | "modes" | "navigate" | "categories";

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
  const t = useMessages();
  const hw = t.howItWorks;
  const steps = useMemo(
    () =>
      [
        { id: "idea" as const, ...hw.steps.idea },
        { id: "modes" as const, ...hw.steps.modes },
        { id: "navigate" as const, ...hw.steps.navigate },
        { id: "categories" as const, ...hw.steps.categories },
      ] satisfies { id: StepId; title: string; subtitle: string }[],
    [hw.steps],
  );
  const [step, setStep] = useState(0);
  const current = steps[step]!;
  const isLast = step >= steps.length - 1;

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <header className="shrink-0 border-b bg-white px-4 pb-3 pt-3" style={{ borderColor: BORDER }}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full"
            aria-label={t.common.back}
          >
            <ArrowLeft className="h-5 w-5" style={{ color: GREEN }} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[18px] font-extrabold" style={{ color: GREEN }}>
              {hw.title(APP_NAME)}
            </h1>
            <p className="text-[12px] text-gray-500">
              {hw.stepOf(step + 1, steps.length)} · {current.subtitle}
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-1.5">
          {steps.map((s, i) => (
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
            <p>{hw.ideaBody1(APP_NAME)}</p>
            <p>{hw.ideaBody2}</p>
            <div className="rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
              <p className="text-[13px] font-semibold text-gray-900">{hw.rememberTitle}</p>
              <p className="mt-1 text-[13px] text-gray-600">{hw.rememberBody}</p>
            </div>
          </div>
        ) : null}

        {current.id === "modes" ? (
          <div className="mt-3 space-y-2">
            {[
              { title: hw.modeRentTitle, body: hw.modeRentBody },
              { title: hw.modeSellTitle, body: hw.modeSellBody },
              { title: hw.modeGiftTitle, body: hw.modeGiftBody },
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
              { title: hw.navHomeTitle, body: hw.navHomeBody },
              { title: hw.navStockTitle, body: hw.navStockBody },
              { title: hw.navGarageTitle, body: hw.navGarageBody },
              { title: hw.navMoreTitle, body: hw.navMoreBody(MASCOT_NAME) },
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
            <CategoryCatalogExplorer hint={hw.catalogHint} />
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
                {hw.browseCta}
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
                {hw.stockCta}
              </button>
            ) : null}
            {onAskEvorios ? (
              <button
                type="button"
                onClick={onAskEvorios}
                className="w-full py-2 text-center text-[13px] font-semibold underline"
                style={{ color: GREEN }}
              >
                {hw.askCta(MASCOT_NAME)}
              </button>
            ) : null}
          </>
        ) : (
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(s + 1, steps.length - 1))}
            className="flex w-full items-center justify-center gap-1 rounded-xl py-3.5 text-[15px] font-bold"
            style={{ backgroundColor: AMBER, color: GREEN }}
          >
            {t.common.next}
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
        {step > 0 && !isLast ? (
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="w-full py-1 text-center text-[13px] font-medium text-gray-500"
          >
            {t.common.back}
          </button>
        ) : null}
      </div>
    </div>
  );
}
