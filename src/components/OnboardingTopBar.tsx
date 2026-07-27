import { ArrowLeft } from "lucide-react";

const GREEN = "#0D5C3A";

type OnboardingTopBarProps = {
  onSkip: () => void;
  onBack?: () => void;
};

export function OnboardingTopBar({ onSkip, onBack }: OnboardingTopBarProps) {
  return (
    <div className="flex shrink-0 items-center justify-between px-4 pb-1 pt-[max(1.25rem,calc(env(safe-area-inset-top,0px)+0.75rem))]">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-[15px] font-medium text-gray-600"
        >
          <ArrowLeft className="h-4 w-4" style={{ color: GREEN }} />
          Back
        </button>
      ) : (
        <span className="w-14" aria-hidden />
      )}
      <button
        type="button"
        onClick={onSkip}
        className="text-[15px] font-semibold text-gray-600 transition-colors active:text-[#0D5C3A]"
      >
        Skip
      </button>
    </div>
  );
}
