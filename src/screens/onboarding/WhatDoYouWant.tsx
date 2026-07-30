import { ONBOARDING } from "../../lib/brand";
import { onboardingAssets } from "../../lib/onboardingAssets";
import { setAppMode } from "../../lib/appMode";
import { OnboardingTopBar } from "../../components/OnboardingTopBar";

const GREEN = "#0D5C3A";
const AMBER = "#F59E0B";

const { roleChoice: copy } = ONBOARDING;

type WhatDoYouWantProps = {
  onEarn: () => void;
  onSave: () => void;
  onSkip: () => void;
  onBack: () => void;
};

function RoleChoiceCard({
  imageSrc,
  title,
  subtitle,
  ctaLabel,
  variant,
  fetchPriority,
  onClick,
}: {
  imageSrc: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  variant: "primary" | "secondary";
  fetchPriority?: "high" | "low" | "auto";
  onClick: () => void;
}) {
  const isPrimary = variant === "primary";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${title}. ${subtitle}`}
      className="role-choice-card flex w-full flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white text-left shadow-sm transition-opacity active:opacity-90"
    >
      <div className="role-choice-art" aria-hidden>
        <img
          src={imageSrc}
          alt=""
          width={1536}
          height={1024}
          className="role-choice-illustration"
          decoding="async"
          fetchPriority={fetchPriority}
          draggable={false}
        />
      </div>
      <div className="role-choice-body shrink-0 px-4 pb-3.5 pt-2.5 text-center">
        <h2 className="role-choice-title text-[17px] font-bold leading-snug" style={{ color: GREEN }}>
          {title}
        </h2>
        <p className="role-choice-subtitle mt-0.5 text-[13px] leading-snug text-gray-500">
          {subtitle}
        </p>
        <span
          className="role-choice-cta mt-3 flex min-h-12 w-full items-center justify-center rounded-xl px-3 text-[15px] font-bold leading-none"
          style={
            isPrimary
              ? { backgroundColor: AMBER, color: GREEN }
              : { border: `2px solid ${GREEN}`, color: GREEN, backgroundColor: "#fff" }
          }
        >
          {ctaLabel}
        </span>
      </div>
    </button>
  );
}

export function WhatDoYouWant({ onEarn, onSave, onSkip, onBack }: WhatDoYouWantProps) {
  return (
    <div className="screen onboarding-step mx-auto w-full max-w-[390px] bg-white">
      <OnboardingTopBar onBack={onBack} onSkip={onSkip} />
      <div className="role-choice-header shrink-0 px-4 pb-2 pt-1 text-center">
        <h1 className="role-choice-page-title text-2xl font-bold" style={{ color: GREEN }}>
          {copy.title}
        </h1>
        <p className="mt-1 text-[15px] text-gray-500">{copy.subtitle}</p>
      </div>

      <div className="role-choice-cards">
        <RoleChoiceCard
          variant="primary"
          imageSrc={onboardingAssets.stockGarage}
          title={copy.stockGarage.title}
          subtitle={copy.stockGarage.subtitle}
          ctaLabel={copy.stockGarage.cta}
          fetchPriority="high"
          onClick={() => {
            setAppMode("earn");
            onEarn();
          }}
        />
        <RoleChoiceCard
          variant="secondary"
          imageSrc={onboardingAssets.browseBlock}
          title={copy.browseBlock.title}
          subtitle={copy.browseBlock.subtitle}
          ctaLabel={copy.browseBlock.cta}
          onClick={() => {
            setAppMode("rent");
            onSave();
          }}
        />
      </div>

      <p className="role-choice-footer shrink-0 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] text-center text-xs text-gray-400">
        {copy.footer}
      </p>
    </div>
  );
}
