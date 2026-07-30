import { ArrowLeft } from "lucide-react";
import { useMessages } from "../lib/i18n/react";

const GREEN = "#0D5C3A";

type OnboardingTopBarProps = {
  onSkip: () => void;
  onBack?: () => void;
};

export function OnboardingTopBar({ onSkip, onBack }: OnboardingTopBarProps) {
  const t = useMessages();
  return (
    <div className="flex shrink-0 items-center justify-between px-4 pb-1 pt-[max(1.25rem,calc(env(safe-area-inset-top,0px)+0.75rem))]">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-[15px] font-medium text-gray-600"
        >
          <ArrowLeft className="h-4 w-4" style={{ color: GREEN }} />
          {t.common.back}
        </button>
      ) : (
        <span className="w-14" aria-hidden />
      )}
      <button
        type="button"
        onClick={onSkip}
        className="text-[15px] font-semibold text-gray-600 transition-colors active:text-[#0D5C3A]"
      >
        {t.common.skip}
      </button>
    </div>
  );
}
