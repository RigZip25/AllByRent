import {
  AlertTriangle,
  Languages,
  Map as MapIcon,
  UtensilsCrossed,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { BackHeader } from "../components/Chrome";
import { AiCard, SectionLabel } from "../components/Ui";
import { cn } from "../lib/cn";
import { useMftStore } from "../store";

const TIMELINE = [
  { id: 1, time: "07:30", title: "Завтрак на террасе", status: "done" as const },
  { id: 2, time: "09:00", title: "Джип к каньону Барра", status: "done" as const },
  { id: 3, time: "12:30", title: "Обед в тени скал", status: "current" as const },
  { id: 4, time: "16:00", title: "Спа в lodge", status: "upcoming" as const },
  { id: 5, time: "19:30", title: "Ужин под звёздами", status: "upcoming" as const },
];

export function LiveDayScreen() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const trip = useMftStore((s) => s.trips.find((t) => t.id === id));

  if (!trip) {
    return (
      <div className="mft-screen">
        <BackHeader title="Live" />
      </div>
    );
  }

  const actions = [
    {
      label: "Рестораны",
      icon: UtensilsCrossed,
      to: `/trip/${trip.id}/restaurants`,
    },
    {
      label: "Переводчик",
      icon: Languages,
      to: `/trip/${trip.id}/translator`,
    },
    {
      label: "SOS",
      icon: AlertTriangle,
      to: `#`,
      danger: true,
    },
    {
      label: "Карта",
      icon: MapIcon,
      to: `/explore`,
    },
  ];

  return (
    <div className="mft-scroll mft-screen h-full">
      <BackHeader title="Live Day" />

      <div className="mb-5 flex items-center justify-between rounded-[12px] bg-[var(--bg-card)] px-4 py-3">
        <div>
          <div className="text-[14px] font-medium">Вади Рам</div>
          <div className="text-[12px] text-[var(--text-muted)]">Иордания</div>
        </div>
        <div className="text-right">
          <div className="text-[18px] font-semibold text-[var(--accent-gold)]">
            28°
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">Ясно · NW 3м/с</div>
        </div>
      </div>

      <AiCard className="mb-6 mft-fade-up">
        Сейчас самое мягкое солнце до 14:00. После обеда ветер усилится — возьмите
        шарф для дюн.
      </AiCard>

      <section className="mb-8">
        <SectionLabel>Сегодня</SectionLabel>
        <div className="space-y-2">
          {TIMELINE.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-3 rounded-[12px] px-4 py-3",
                item.status === "current"
                  ? "bg-[var(--accent-amber-soft)] ring-1 ring-[var(--accent-gold)]/40"
                  : "bg-[var(--bg-card)]",
                item.status === "done" && "opacity-45",
              )}
            >
              <span
                className={cn(
                  "w-12 shrink-0 text-[12px]",
                  item.status === "current"
                    ? "font-semibold text-[var(--accent-gold)]"
                    : "text-[var(--text-muted)]",
                )}
              >
                {item.time}
              </span>
              <span className="text-[14px]">{item.title}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionLabel>Быстрые действия</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.label}
                type="button"
                onClick={() => {
                  if (a.to !== "#") navigate(a.to);
                }}
                className={cn(
                  "flex items-center gap-2 rounded-full bg-[var(--bg-card)] px-4 py-3 text-left text-[13px]",
                  a.danger && "text-[var(--status-failed)]",
                )}
              >
                <Icon className="h-4 w-4 text-[var(--accent-gold)]" />
                {a.label}
              </button>
            );
          })}
        </div>
      </section>

      <button
        type="button"
        className="mt-8 w-full text-center text-[13px] text-[var(--accent-gold)]"
        onClick={() => navigate(`/trip/${trip.id}/summary`)}
      >
        Завершить путешествие →
      </button>
    </div>
  );
}
