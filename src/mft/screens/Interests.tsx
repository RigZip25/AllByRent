import { Check } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../components/Button";
import { INTERESTS } from "../data/interests";
import { cn } from "../lib/cn";
import { useMftStore } from "../store";

export function InterestsScreen() {
  const navigate = useNavigate();
  const interests = useMftStore((s) => s.profile.interests);
  const toggleInterest = useMftStore((s) => s.toggleInterest);

  return (
    <div className="mft-screen flex min-h-full flex-col">
      <h1 className="mft-fade-up text-[28px] font-semibold tracking-tight text-[var(--text-cream)]">
        Что вас зовёт?
      </h1>
      <p className="mft-fade-up mft-fade-up-delay-1 mt-2 text-[14px] text-[var(--text-muted)]">
        Выберите интересы — AI подберёт маршруты под ваш вкус
      </p>

      <div className="mft-fade-up mft-fade-up-delay-2 mt-8 grid grid-cols-3 gap-3">
        {INTERESTS.map((item) => {
          const selected = interests.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleInterest(item.id)}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center gap-2 rounded-[12px] border bg-[var(--bg-card)] p-2 text-center transition",
                selected
                  ? "border-[var(--accent-gold)]"
                  : "border-transparent hover:bg-[var(--bg-card-hover)]",
              )}
            >
              {selected ? (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent-gold)] text-[var(--text-inverse)]">
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
              ) : null}
              <span className="text-[22px]" aria-hidden>
                {item.emoji}
              </span>
              <span className="text-[11px] leading-tight text-[var(--text-cream)]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-8">
        <Button
          fullWidth
          disabled={interests.length === 0}
          onClick={() => navigate("/onboarding/profile")}
        >
          Далее · {interests.length}
        </Button>
      </div>
    </div>
  );
}
