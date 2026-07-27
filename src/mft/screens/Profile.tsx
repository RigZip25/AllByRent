import { useNavigate } from "react-router";
import { Button } from "../components/Button";
import { Wordmark } from "../components/Chrome";
import { TabBar } from "../components/TabBar";
import { INTERESTS } from "../data/interests";
import { useMftStore } from "../store";

export function ProfileScreen() {
  const navigate = useNavigate();
  const profile = useMftStore((s) => s.profile);
  const resetDemo = useMftStore((s) => s.resetDemo);
  const trips = useMftStore((s) => s.trips);
  const completed = trips.filter((t) => t.status === "completed").length;

  return (
    <div className="relative flex h-full flex-col">
      <div className="mft-scroll mft-screen with-tabs">
        <Wordmark size="sm" className="mb-8" />
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-amber-soft)] text-[24px] font-semibold text-[var(--accent-gold)]">
            {(profile.name || "M").slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h1 className="text-[22px] font-semibold">
              {profile.name || "Путешественник"}
            </h1>
            <p className="text-[13px] text-[var(--text-muted)]">
              {profile.companions} · {profile.pace}
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-2 text-center">
          {[
            [completed, "завершено"],
            [profile.wishlist.length, "мечты"],
            [`${profile.comfortLevel}%`, "комфорт"],
          ].map(([v, l]) => (
            <div key={String(l)} className="rounded-[12px] bg-[var(--bg-card)] py-4">
              <div className="text-[18px] font-semibold text-[var(--accent-gold)]">
                {v}
              </div>
              <div className="text-[10px] text-[var(--text-muted)]">{l}</div>
            </div>
          ))}
        </div>

        <section className="mt-8">
          <h2 className="mb-3 text-[12px] font-semibold tracking-[0.14em] text-[var(--accent-gold)] uppercase">
            Интересы
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile.interests.length
              ? profile.interests.map((id) => {
                  const item = INTERESTS.find((i) => i.id === id);
                  return (
                    <span
                      key={id}
                      className="rounded-full bg-[var(--bg-card)] px-3 py-1.5 text-[12px]"
                    >
                      {item?.emoji} {item?.label}
                    </span>
                  );
                })
              : (
                <span className="text-[13px] text-[var(--text-muted)]">
                  Не выбраны
                </span>
              )}
          </div>
        </section>

        <div className="mt-10 space-y-3">
          <Button fullWidth onClick={() => navigate("/trip/create")}>
            Новое путешествие
          </Button>
          <Button
            variant="ghost"
            fullWidth
            onClick={() => {
              resetDemo();
              navigate("/welcome");
            }}
          >
            Сбросить демо
          </Button>
        </div>
      </div>
      <TabBar />
    </div>
  );
}
