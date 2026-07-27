import { useNavigate } from "react-router";
import { Button } from "../components/Button";
import { COMPANIONS, PACES } from "../data/interests";
import { cn } from "../lib/cn";
import { useMftStore } from "../store";

export function ProfileOnboardingScreen() {
  const navigate = useNavigate();
  const profile = useMftStore((s) => s.profile);
  const setName = useMftStore((s) => s.setName);
  const setCompanions = useMftStore((s) => s.setCompanions);
  const setPace = useMftStore((s) => s.setPace);
  const setComfort = useMftStore((s) => s.setComfort);
  const setBudget = useMftStore((s) => s.setBudget);
  const completeOnboarding = useMftStore((s) => s.completeOnboarding);

  return (
    <div className="mft-screen flex min-h-full flex-col">
      <h1 className="mft-fade-up text-[28px] font-semibold tracking-tight">
        Расскажите о себе
      </h1>
      <p className="mft-fade-up mft-fade-up-delay-1 mt-2 text-[14px] text-[var(--text-muted)]">
        Чтобы AI знал ваш ритм и уровень комфорта
      </p>

      <div className="mft-fade-up mft-fade-up-delay-2 mt-8 space-y-6">
        <label className="block">
          <span className="mb-2 block text-[12px] text-[var(--text-muted)]">Имя</span>
          <input
            value={profile.name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Как к вам обращаться?"
            className="h-12 w-full rounded-[12px] border-0 bg-[var(--bg-input)] px-4 text-[15px] text-[var(--text-cream)] outline-none ring-1 ring-white/5 placeholder:text-[var(--text-dim)] focus:ring-[var(--accent-gold)]/40"
          />
        </label>

        <div>
          <span className="mb-2 block text-[12px] text-[var(--text-muted)]">
            Компаньоны
          </span>
          <div className="flex flex-wrap gap-2">
            {COMPANIONS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCompanions(c.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-[13px] transition",
                  profile.companions === c.id
                    ? "bg-[var(--accent-primary)] text-white"
                    : "bg-[var(--bg-card)] text-[var(--text-cream)]",
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-2 block text-[12px] text-[var(--text-muted)]">Темп</span>
          <div className="flex flex-wrap gap-2">
            {PACES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPace(p.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-[13px] transition",
                  profile.pace === p.id
                    ? "bg-[var(--accent-primary)] text-white"
                    : "bg-[var(--bg-card)] text-[var(--text-cream)]",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex justify-between text-[12px] text-[var(--text-muted)]">
            <span>Комфорт</span>
            <span className="text-[var(--accent-gold)]">{profile.comfortLevel}%</span>
          </div>
          <input
            type="range"
            min={40}
            max={100}
            value={profile.comfortLevel}
            onChange={(e) => setComfort(Number(e.target.value))}
            className="w-full accent-[var(--accent-gold)]"
          />
        </div>

        <div>
          <div className="mb-2 flex justify-between text-[12px] text-[var(--text-muted)]">
            <span>Бюджет на поездку</span>
            <span className="text-[var(--accent-gold)]">
              ${profile.budgetMin.toLocaleString()} – $
              {profile.budgetMax.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min={1000}
            max={20000}
            step={500}
            value={profile.budgetMax}
            onChange={(e) =>
              setBudget(profile.budgetMin, Number(e.target.value))
            }
            className="w-full accent-[var(--accent-primary)]"
          />
        </div>
      </div>

      <div className="mt-auto pt-8">
        <Button
          fullWidth
          disabled={!profile.name.trim()}
          onClick={() => {
            completeOnboarding();
            navigate("/");
          }}
        >
          Создать мой мир
        </Button>
      </div>
    </div>
  );
}
