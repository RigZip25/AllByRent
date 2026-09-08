import { OnboardingTopBar } from "../../components/OnboardingTopBar";
import { APP_NAME } from "../../lib/brand";
import { onboardingAssets } from "../../lib/onboardingAssets";
import { getAppMode } from "../../lib/appMode";
import { getRentContext } from "../../lib/listingStorage";
import { getProfileLocationSummary, loadUserProfile } from "../../lib/userProfileStorage";
import { useAppModeLabels, useMessages, useOnboardingCopy } from "../../lib/i18n/react";

const GREEN = "#0D5C3A";

type YouAreAllSetProps = {
  onExplore: () => void;
  onBack?: () => void;
  onSkip?: () => void;
};

export function YouAreAllSet({ onExplore, onBack, onSkip }: YouAreAllSetProps) {
  const { allSet: copy } = useOnboardingCopy();
  const modeLabels = useAppModeLabels();
  const { tagline } = useMessages();
  const location = getProfileLocationSummary();
  const mode = getAppMode();
  const shopKind = loadUserProfile().garageIdentity?.shopKind === "pro" ? "pro" : "personal";
  const accountType = shopKind === "pro" ? copy.accountPro : copy.accountPersonal;
  const tags: string[] = [];
  if (mode === "earn") tags.push(modeLabels.earn);
  if (mode === "rent") tags.push(modeLabels.rent);
  const context = getRentContext();
  if (context === "trip") tags.push(copy.visiting);
  if (context === "home") tags.push(copy.onMyBlock);
  if (tags.length === 0) tags.push(copy.exploreTag);
  const goals = tags;

  return (
    <div className="screen mx-auto flex h-full min-h-0 w-full max-w-[430px] flex-col overflow-hidden bg-white">
      {onBack || onSkip ? (
        <OnboardingTopBar onBack={onBack} onSkip={onSkip ?? onExplore} />
      ) : null}
      <div className="screen-scroll flex min-h-0 flex-1 flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pt-6">
        <div className="flex flex-col items-center text-center">
          <img
            src={onboardingAssets.mrEvoriosFull}
            alt=""
            className="h-36 w-auto max-w-[220px] object-contain"
            draggable={false}
          />
          <h1 className="mt-4 text-2xl font-bold" style={{ color: GREEN }}>
            {copy.title}
          </h1>
          <p className="mt-2 text-base text-gray-500">{copy.subtitle}</p>
          <p className="mt-1 text-sm font-medium text-gray-600">{tagline}</p>
        </div>

        <div className="mt-6 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {copy.profileHeading(APP_NAME)}
          </p>
          <dl className="mt-3 space-y-2.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-gray-500">{copy.typeLabel}</dt>
              <dd className="font-semibold text-gray-900">{accountType}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-500">{copy.blockLabel}</dt>
              <dd className="max-w-[58%] text-right font-semibold text-gray-900">
                {location}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">{copy.focusLabel}</dt>
              <dd className="mt-2 flex flex-wrap gap-2">
                {goals.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full px-2.5 py-1 text-xs font-semibold text-white"
                    style={{ backgroundColor: GREEN }}
                  >
                    {tag}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </div>

        <button
          type="button"
          onClick={onExplore}
          className="btn-primary mt-auto h-auto min-h-[56px] w-full rounded-xl px-3 py-3.5 text-base font-bold leading-snug text-white"
          style={{ backgroundColor: GREEN }}
        >
          {copy.exploreCta}
        </button>
      </div>
    </div>
  );
}
