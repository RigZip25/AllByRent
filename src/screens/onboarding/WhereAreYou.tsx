import atHomeImg from "../../imports/at_home.png";
import whileTravelingImg from "../../imports/while_traveling.png";
import { OnboardingTopBar } from "../../components/OnboardingTopBar";

const GREEN = "#0D5C3A";
const AMBER = "#F59E0B";

type WhereAreYouProps = {
  onAtHome: () => void;
  onTraveling: () => void;
  onBack: () => void;
  onSkip: () => void;
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
      className="where-are-you-choice w-full rounded-2xl border border-[#E5E7EB] bg-white text-left shadow-sm transition-opacity active:opacity-90 disabled:opacity-70"
    >
      <div className="where-are-you-choice-art flex justify-center rounded-t-2xl px-3 pt-3">
        <img
          src={imageSrc}
          alt=""
          className="where-are-you-choice-illustration w-full object-contain"
          draggable={false}
        />
      </div>
      <div className="where-are-you-choice-body px-5 pb-5 pt-4 text-center">
        <h2 className="text-lg font-bold" style={{ color: GREEN }}>
          {title}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{subtitle}</p>
        <span
          className="mt-4 flex w-full items-center justify-center rounded-xl py-3 text-base font-bold"
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
  isLocatingHome = false,
  locationError = null,
}: WhereAreYouProps) {
  return (
    <div className="screen screen-adaptive mx-auto w-full max-w-[390px] flex-col bg-white">
      <OnboardingTopBar onBack={onBack} onSkip={onSkip} />
      <div className="shrink-0 px-4 pb-3 pt-2 text-center">
        <h1 className="text-2xl font-bold" style={{ color: GREEN }}>
          Where are you?
        </h1>
        <p className="mt-1 text-base text-gray-500">
          This helps us show the right listings.
        </p>
        {locationError ? (
          <p
            className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-left text-sm text-amber-900"
            role="status"
          >
            {locationError}
          </p>
        ) : null}
      </div>

      <div className="screen-scroll flex flex-col gap-5 px-4 py-4 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]">
        <ChoiceCard
          variant="earn"
          imageSrc={atHomeImg}
          title="I'm at home"
          subtitle="Use your location or street address — we sort by distance to you."
          ctaLabel={isLocatingHome ? "Finding your location…" : "Browse near me →"}
          ariaLabel="I'm at home. Browse listings near you."
          onClick={onAtHome}
          disabled={isLocatingHome}
        />

        <ChoiceCard
          variant="save"
          imageSrc={whileTravelingImg}
          title="I'm planning a trip"
          subtitle="Find what you need at your destination before you land."
          ctaLabel="Find at destination →"
          ariaLabel="I'm planning a trip. Find what you need at your destination."
          onClick={onTraveling}
          disabled={isLocatingHome}
        />
      </div>
    </div>
  );
}
