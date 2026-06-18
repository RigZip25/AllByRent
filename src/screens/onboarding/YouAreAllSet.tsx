import { APP_MODE_LABELS, APP_NAME, APP_TAGLINE, ONBOARDING } from "../../lib/brand";
import { onboardingAssets } from "../../lib/onboardingAssets";
import { getAppMode } from "../../lib/appMode";
import { getRentContext } from "../../lib/listingStorage";
import { getProfileLocationSummary } from "../../lib/userProfileStorage";
import { loadSubscriptionPlanId } from "../../lib/subscriptionPlans";

const GREEN = "#0D5C3A";

const { allSet: copy } = ONBOARDING;

type YouAreAllSetProps = {
  onExplore: () => void;
};

function accountTypeLabel(): string {
  const plan = loadSubscriptionPlanId();
  return plan === "business" ? "Business" : "Individual";
}

function goalTags(): string[] {
  const mode = getAppMode();
  const tags: string[] = [];
  if (mode === "earn") tags.push(APP_MODE_LABELS.earn);
  if (mode === "rent") tags.push(APP_MODE_LABELS.rent);
  const context = getRentContext();
  if (context === "trip") tags.push("Visiting");
  if (context === "home") tags.push("On my block");
  if (tags.length === 0) tags.push("Explore");
  return tags;
}

export function YouAreAllSet({ onExplore }: YouAreAllSetProps) {
  const location = getProfileLocationSummary();
  const goals = goalTags();

  return (
    <div className="screen mx-auto flex h-full min-h-0 w-full max-w-[390px] flex-col overflow-hidden bg-white">
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
          <p className="mt-1 text-sm font-medium text-gray-600">{APP_TAGLINE}</p>
        </div>

        <div className="mt-6 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Your {APP_NAME} profile
          </p>
          <dl className="mt-3 space-y-2.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-gray-500">Type</dt>
              <dd className="font-semibold text-gray-900">{accountTypeLabel()}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-500">Block</dt>
              <dd className="max-w-[58%] text-right font-semibold text-gray-900">
                {location}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Focus</dt>
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
          className="btn-primary mt-auto w-full rounded-xl py-3.5 text-base font-bold text-white"
          style={{ backgroundColor: GREEN }}
        >
          {copy.exploreCta}
        </button>
      </div>
    </div>
  );
}
