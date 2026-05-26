import { ArrowLeft } from "lucide-react";

const GREEN = "#0D5C3A";

type OnboardingTopBarProps = {
  onSkip: () => void;
  onBack?: () => void;
};

export function OnboardingTopBar({ onSkip, onBack }: OnboardingTopBarProps) {
  return (
    <div className="flex shrink-0 items-center justify-between px-4 pb-1 pt-3">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-sm font-medium text-gray-600"
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
        className="text-sm font-medium text-[#9CA3AF] transition-colors active:text-[#374151]"
      >
        Skip
      </button>
    </div>
  );
}
