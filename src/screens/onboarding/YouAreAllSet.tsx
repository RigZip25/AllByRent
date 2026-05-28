import rentanoImg from "../../imports/rentano_full.png";
import { getAppMode } from "../../lib/appMode";
import { getRentContext } from "../../lib/listingStorage";
import { getProfileLocationSummary } from "../../lib/userProfileStorage";
import { loadSubscriptionPlanId } from "../../lib/subscriptionPlans";

const GREEN = "#0D5C3A";

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
  if (mode === "earn") tags.push("Earn");
  if (mode === "rent") tags.push("Rent & save");
  const context = getRentContext();
  if (context === "trip") tags.push("Traveling");
  if (context === "home") tags.push("At home");
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
            src={rentanoImg}
            alt=""
            className="h-36 w-auto max-w-[220px] object-contain"
            draggable={false}
          />
          <h1 className="mt-4 text-2xl font-bold" style={{ color: GREEN }}>
            You are all set!
          </h1>
          <p className="mt-2 text-base text-gray-500">Welcome to the sharing economy</p>
        </div>

        <div className="mt-6 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Your profile
          </p>
          <dl className="mt-3 space-y-2.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-gray-500">Type</dt>
              <dd className="font-semibold text-gray-900">{accountTypeLabel()}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-500">Location</dt>
              <dd className="max-w-[58%] text-right font-semibold text-gray-900">
                {location}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Goals</dt>
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

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "Items nearby", value: "120+" },
            { label: "Neighbors", value: "2.4k" },
            { label: "Avg earned/mo", value: "$340" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-[#E5E7EB] bg-white px-2 py-3 text-center shadow-sm"
            >
              <p className="text-lg font-bold" style={{ color: GREEN }}>
                {stat.value}
              </p>
              <p className="mt-1 text-[11px] leading-tight text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onExplore}
          className="btn-primary mt-auto w-full rounded-xl py-3.5 text-base font-bold text-white"
          style={{ backgroundColor: GREEN }}
        >
          Explore AllByRent →
        </button>
      </div>
    </div>
  );
}
