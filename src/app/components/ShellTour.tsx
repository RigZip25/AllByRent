import { useState } from "react";
import { MrRentano } from "./MrRentano";
import type { AppMode } from "../../lib/appMode";

const GREEN = "#0D5C3A";
const GREEN_LIGHT = "#1A9E6E";
const BORDER = "#E8E6E0";

type TourStep = {
  title: string;
  body: string;
  tabHint?: string;
};

function getSteps(appMode: AppMode): TourStep[] {
  const fourthTab =
    appMode === "earn"
      ? {
          title: "Business",
          body: "Track listings, earnings, and how your items are performing.",
          tabHint: "4th tab · Business",
        }
      : {
          title: "Favorites",
          body: "Save items you love and come back when you're ready to rent.",
          tabHint: "4th tab · Favorites",
        };

  return [
    {
      title: "Home",
      body: "Browse categories and discover what's available near you.",
      tabHint: "1st tab · Home",
    },
    {
      title: "Rentals",
      body: "Your active deals, requests, and rental history live here.",
      tabHint: "2nd tab · Rentals",
    },
    {
      title: "Rentano",
      body: "Tap me anytime — ask questions, get tips, and find your way around.",
      tabHint: "Center · Rentano",
    },
    fourthTab,
    {
      title: "Profile",
      body: "Settings, trust & safety, subscription, and your account details.",
      tabHint: "5th tab · Profile",
    },
  ];
}

export function ShellTour({
  appMode,
  onComplete,
  onSkip,
}: {
  appMode: AppMode;
  onComplete: () => void;
  onSkip: () => void;
}) {
  const steps = getSteps(appMode);
  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
      return;
    }
    setStepIndex((i) => i + 1);
  };

  return (
    <div
      className="fixed inset-0 z-[75] flex flex-col"
      style={{ backgroundColor: "#F0F4F2" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shell-tour-title"
    >
      <div className="flex shrink-0 items-center justify-end px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top,0px))]">
        <button
          type="button"
          onClick={onSkip}
          className="rounded-full px-3 py-2 text-[14px] font-medium text-gray-500 transition-colors hover:bg-white/80"
        >
          Skip tour
        </button>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-6">
        <div className="flex justify-center">
          <MrRentano size={120} />
        </div>

        <div
          className="mt-6 rounded-2xl border bg-white p-5 shadow-sm"
          style={{ borderColor: BORDER }}
        >
          {step.tabHint ? (
            <p
              className="mb-2 text-[12px] font-semibold uppercase tracking-wide"
              style={{ color: GREEN_LIGHT }}
            >
              {step.tabHint}
            </p>
          ) : null}
          <h2 id="shell-tour-title" className="text-[20px] font-bold" style={{ color: GREEN }}>
            {step.title}
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-gray-600">{step.body}</p>
        </div>

        <p className="mt-4 text-center text-[13px] text-gray-500">
          Hi, I&apos;m Rentano — quick tour of the app bar so you always know where to go.
        </p>

        <div className="mt-auto space-y-4 pt-8">
          <div className="flex justify-center gap-2">
            {steps.map((_, i) => (
              <span
                key={i}
                className="h-2 rounded-full transition-all"
                style={{
                  width: i === stepIndex ? 20 : 8,
                  backgroundColor: i === stepIndex ? GREEN : "#D1D5DB",
                }}
                aria-hidden="true"
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="w-full rounded-2xl py-4 text-[16px] font-bold text-white shadow-sm transition-opacity hover:opacity-95"
            style={{ backgroundColor: GREEN }}
          >
            {isLast ? "Got it" : "Next"}
          </button>
        </div>
      </div>

      <div
        className="pointer-events-none shrink-0 border-t bg-white px-2 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pt-2 opacity-40"
        style={{ borderColor: BORDER, minHeight: 84 }}
        aria-hidden="true"
      >
        <div className="mx-auto flex max-w-md items-end justify-around">
          {["Home", "Rentals", "Rentano", appMode === "earn" ? "Business" : "Favorites", "Profile"].map(
            (label) => (
              <span key={label} className="min-w-[56px] text-center text-[11px] text-gray-400">
                {label}
              </span>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
