import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GarageSharePanel } from "../components/share/GarageSharePanel";
import { useAuth } from "../hooks/AuthProvider";
import { resolveHostAccountId } from "../lib/hostIdentity";
import { hostGarageSharePayload } from "../lib/garageMarketingShare";
import { BRAND_AMBER, BRAND_GREEN, MASCOT_NAME, ONBOARDING } from "../lib/brand";
import {
  GARAGE_SALE_DAY_LABELS,
  GARAGE_SALE_PRESETS,
  garageSaleOpenLabel,
  garageSalePresetSchedule,
  getGarageSaleSchedule,
  isGarageSaleScheduleValid,
  toggleGarageSaleDay,
  type GarageSalePresetId,
  type GarageSaleSchedule,
} from "../lib/garageSaleStorage";
import { persistSaleSchedule } from "../lib/repositories/garageRepository";
import { onboardingAssets } from "../lib/onboardingAssets";

const GREEN = BRAND_GREEN;
const AMBER = BRAND_AMBER;
const BORDER = "#E8E6E0";

const { openGarageSale: copy } = ONBOARDING;

type OpenGarageSaleScreenProps = {
  onBack: () => void;
  onAddSaleItems: () => void;
  onOpenMyGarage: () => void;
  onViewSaleRules: () => void;
};

export function OpenGarageSaleScreen({
  onBack,
  onAddSaleItems,
  onOpenMyGarage,
  onViewSaleRules,
}: OpenGarageSaleScreenProps) {
  const auth = useAuth();
  const hostId = resolveHostAccountId(auth.userId);
  const [schedule, setSchedule] = useState<GarageSaleSchedule>(() => getGarageSaleSchedule());

  const persist = useCallback(
    (next: GarageSaleSchedule) => {
      setSchedule(next);
      void persistSaleSchedule(hostId, next);
    },
    [hostId],
  );

  useEffect(() => {
    const sync = () => setSchedule(getGarageSaleSchedule());
    window.addEventListener("evorios-garage-schedule", sync);
    return () => window.removeEventListener("evorios-garage-schedule", sync);
  }, []);

  const applyPreset = (preset: GarageSalePresetId) => {
    persist(garageSalePresetSchedule(preset));
  };

  const scheduleValid = isGarageSaleScheduleValid(schedule);
  const openLabel = garageSaleOpenLabel(schedule);
  const garageSharePayload = useMemo(
    () =>
      hostGarageSharePayload({
        hostId,
        openUntilLabel: openLabel,
      }),
    [hostId, openLabel],
  );

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#FFF9F0]">
      <div
        className="shrink-0 border-b px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))]"
        style={{ borderColor: `${AMBER}44` }}
      >
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
            className="max-h-[clamp(100px,18dvh,160px)] w-full max-w-[280px] object-contain"
            draggable={false}
          />
        </div>

        <section className="mt-2 rounded-2xl border bg-white p-4" style={{ borderColor: `${AMBER}55` }}>
          <h2 className="text-base font-bold text-gray-900">{copy.hoursTitle}</h2>
          <p className="mt-1 text-sm text-gray-500">{copy.hoursHint}</p>

          <p className="mt-4 text-[13px] font-semibold text-gray-800">{copy.daysLabel}</p>
          <div className="mt-2 grid grid-cols-7 gap-1.5">
            {GARAGE_SALE_DAY_LABELS.map((label, day) => {
              const selected = schedule.daysOfWeek.includes(day);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => persist(toggleGarageSaleDay(schedule, day))}
                  className="flex aspect-square items-center justify-center rounded-xl border text-[12px] font-bold transition-colors"
                  style={{
                    borderColor: selected ? AMBER : BORDER,
                    backgroundColor: selected ? `${AMBER}22` : "#fff",
                    color: selected ? "#92400E" : "#4B5563",
                  }}
                  aria-pressed={selected}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-[13px] font-semibold text-gray-800">{copy.timeLabel}</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-[12px] font-medium text-gray-500">{copy.timeFrom}</span>
              <input
                type="time"
                value={schedule.startTime}
                onChange={(event) => persist({ ...schedule, startTime: event.target.value })}
                className="mt-1 w-full rounded-xl border px-3 py-2.5 text-base font-semibold text-gray-900"
                style={{ borderColor: BORDER }}
              />
            </label>
            <label className="block">
              <span className="text-[12px] font-medium text-gray-500">{copy.timeTo}</span>
              <input
                type="time"
                value={schedule.endTime}
                onChange={(event) => persist({ ...schedule, endTime: event.target.value })}
                className="mt-1 w-full rounded-xl border px-3 py-2.5 text-base font-semibold text-gray-900"
                style={{ borderColor: BORDER }}
              />
            </label>
          </div>

          {!scheduleValid ? (
            <p className="mt-2 text-xs font-medium text-red-600">
              Pick at least one day and make sure end time is after start.
            </p>
          ) : null}

          <p className="mt-3 text-[12px] font-semibold text-gray-600">{copy.presetsLabel}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {GARAGE_SALE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className="rounded-full border px-3 py-1.5 text-[12px] font-semibold active:opacity-90"
                style={{ borderColor: BORDER, color: GREEN }}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <p className="mt-3 text-xs font-medium" style={{ color: "#92400E" }}>
            {copy.neighborsSee} {garageSaleOpenLabel(schedule)}
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
            disabled={!scheduleValid}
            className="mt-4 w-full rounded-xl py-3.5 text-base font-bold text-white active:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: AMBER, color: GREEN }}
          >
            {copy.addItemsCta}
          </button>
          <button
            type="button"
            onClick={onOpenMyGarage}
            disabled={!scheduleValid}
            className="mt-2 w-full rounded-xl border-2 py-3 text-base font-bold active:opacity-90 disabled:opacity-50"
            style={{ borderColor: GREEN, color: GREEN }}
          >
            {copy.myGarageCta}
          </button>
        </section>

        {scheduleValid ? (
          <div className="mt-4">
            <GarageSharePanel
              title={copy.shareGarageCta}
              payload={garageSharePayload}
              shareKind="garage"
              targetId={hostId}
            />
          </div>
        ) : null}

        <button
          type="button"
          onClick={onViewSaleRules}
          className="mt-4 w-full py-2 text-center text-[13px] font-semibold"
          style={{ color: GREEN }}
        >
          {copy.rulesViewCta}
        </button>

        <p className="mt-4 text-center text-xs text-gray-500">
          {MASCOT_NAME} {copy.mascotHint}
        </p>
      </div>
    </div>
  );
}
