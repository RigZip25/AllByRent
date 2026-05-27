import earnImg from "../../imports/earn.png";
import saveImg from "../../imports/save.png";
import { setAppMode } from "../../lib/appMode";
import { OnboardingTopBar } from "../../components/OnboardingTopBar";

const GREEN = "#0D5C3A";
const AMBER = "#F59E0B";

type WhatDoYouWantProps = {
  onEarn: () => void;
  onSave: () => void;
  onSkip: () => void;
  onBack: () => void;
};

export function WhatDoYouWant({ onEarn, onSave, onSkip, onBack }: WhatDoYouWantProps) {
  return (
    <div className="screen screen-adaptive mx-auto w-full max-w-[390px] flex-col bg-white">
      <OnboardingTopBar onBack={onBack} onSkip={onSkip} />
      <div className="shrink-0 px-4 pb-2 pt-2 text-center">
        <h1 className="text-2xl font-bold" style={{ color: GREEN }}>
          What brings you here?
        </h1>
        <p className="mt-1 text-base text-gray-500">
          We&apos;ll set things up for you.
        </p>
      </div>

      <div className="screen-scroll flex flex-col gap-4 px-4 py-4 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]">
        <article className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
          <div className="flex justify-center overflow-hidden rounded-t-2xl px-4 pt-4">
            <img
              src={earnImg}
              alt=""
              className="what-do-you-want-illustration w-full object-contain"
              draggable={false}
            />
          </div>
          <div className="px-4 pb-4 pt-3 text-center">
            <h2 className="text-lg font-bold" style={{ color: GREEN }}>
              I want to earn
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Turn your stuff into income
            </p>
            <button
              type="button"
              onClick={() => {
                setAppMode("earn");
                onEarn();
              }}
              className="mt-4 w-full rounded-xl py-3 text-base font-bold transition-opacity active:opacity-90"
              style={{ backgroundColor: AMBER, color: GREEN }}
            >
              Start earning →
            </button>
          </div>
        </article>

        <article className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
          <div className="flex justify-center overflow-hidden rounded-t-2xl px-4 pt-4">
            <img
              src={saveImg}
              alt=""
              className="what-do-you-want-illustration w-full object-contain"
              draggable={false}
            />
          </div>
          <div className="px-4 pb-4 pt-3 text-center">
            <h2 className="text-lg font-bold" style={{ color: GREEN }}>
              I want to save
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">Rent instead of buy</p>
            <button
              type="button"
              onClick={() => {
                setAppMode("rent");
                onSave();
              }}
              className="mt-4 w-full rounded-xl border-2 py-3 text-base font-bold transition-opacity active:opacity-90"
              style={{ borderColor: GREEN, color: GREEN }}
            >
              Start saving →
            </button>
          </div>
        </article>

        <p className="shrink-0 pb-1 text-center text-xs text-gray-400">
          You can always do both
        </p>
      </div>
    </div>
  );
}
