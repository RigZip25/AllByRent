import { ONBOARDING } from "../../lib/brand";
import { onboardingAssets } from "../../lib/onboardingAssets";
import { OnboardingTopBar } from "../../components/OnboardingTopBar";

const GREEN = "#0D5C3A";
const AMBER = "#F59E0B";

const { location: copy } = ONBOARDING;

type WhereAreYouProps = {
  onAtHome: () => void;
  onTraveling: () => void;
  onBack: () => void;
  onSkip: () => void;
  onEnterManually?: () => void;
  isLocatingHome?: boolean;
  locationError?: string | null;
};

function ChoiceCard({
  onClick,
  imageSrc,
  title,
  subtitle,
  ctaLabel,
  ariaLabel,
  variant,
  disabled = false,
}: {
  onClick: () => void;
  imageSrc: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ariaLabel: string;
  variant: "earn" | "save";
  disabled?: boolean;
}) {
  const isEarn = variant === "earn";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-busy={disabled}
      className="where-are-you-choice flex w-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white text-left shadow-sm transition-opacity active:opacity-90 disabled:opacity-70"
    >
      <div className="where-are-you-choice-art rounded-t-2xl">
        <img
          src={imageSrc}
          alt=""
          className="where-are-you-choice-illustration"
          draggable={false}
        />
      </div>
      <div className="where-are-you-choice-body shrink-0 px-4 pb-4 pt-3 text-center sm:px-5 sm:pb-5 sm:pt-4">
        <h2 className="where-are-you-choice-title text-lg font-bold" style={{ color: GREEN }}>
          {title}
        </h2>
        <p className="where-are-you-choice-subtitle mt-1 text-sm leading-relaxed text-gray-500">
          {subtitle}
        </p>
        <span
          className="where-are-you-choice-cta mt-3 flex w-full items-center justify-center rounded-xl py-2.5 text-base font-bold sm:mt-4 sm:py-3"
          style={
            isEarn
              ? { backgroundColor: AMBER, color: GREEN }
              : { border: `2px solid ${GREEN}`, color: GREEN }
          }
        >
          {ctaLabel}
        </span>
      </div>
    </button>
  );
}

export function WhereAreYou({
  onAtHome,
  onTraveling,
  onBack,
  onSkip,
  onEnterManually,
  isLocatingHome = false,
  locationError = null,
}: WhereAreYouProps) {
  return (
    <div className="screen onboarding-step mx-auto w-full max-w-[390px] bg-white">
      <OnboardingTopBar onBack={onBack} onSkip={onSkip} />
      <div className="where-are-you-header shrink-0 px-4 pb-2 pt-1 text-center">
        <h1 className="where-are-you-page-title text-2xl font-bold" style={{ color: GREEN }}>
          {copy.title}
        </h1>
        <p className="mt-1 text-base text-gray-500">{copy.subtitle}</p>
        {locationError ? (
          <p
            className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-left text-sm text-amber-900"
            role="status"
          >
            {locationError}
          </p>
        ) : null}
      </div>

      <div className="where-are-you-cards">
        <ChoiceCard
          variant="earn"
          imageSrc={onboardingAssets.onBlock}
          title={copy.onBlock.title}
          subtitle={copy.onBlock.subtitle}
          ctaLabel={isLocatingHome ? "Finding your location…" : copy.onBlock.cta}
          ariaLabel={`${copy.onBlock.title}. Browse neighborhood garages near you.`}
          onClick={onAtHome}
          disabled={isLocatingHome}
        />

        <ChoiceCard
          variant="save"
          imageSrc={onboardingAssets.tripDestination}
          title={copy.trip.title}
          subtitle={copy.trip.subtitle}
          ctaLabel={copy.trip.cta}
          ariaLabel={`${copy.trip.title}. Pick a destination area.`}
          onClick={onTraveling}
          disabled={isLocatingHome}
        />
      </div>

      {onEnterManually ? (
        <div className="shrink-0 px-4 pb-6 pt-2 text-center">
          <button
            type="button"
            onClick={onEnterManually}
            disabled={isLocatingHome}
            className="text-[14px] font-semibold underline disabled:opacity-60"
            style={{ color: GREEN }}
          >
            Enter my address manually
          </button>
        </div>
      ) : null}
    </div>
  );
}
