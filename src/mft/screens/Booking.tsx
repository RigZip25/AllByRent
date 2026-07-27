import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../components/Button";
import { BackHeader } from "../components/Chrome";
import { SectionLabel } from "../components/Ui";
import { useMftStore } from "../store";
import type { BookingStatus } from "../types";

const statusUi: Record<
  BookingStatus,
  { label: string; icon: typeof CheckCircle2; color: string }
> = {
  confirmed: {
    label: "Подтверждено",
    icon: CheckCircle2,
    color: "text-[var(--status-success)]",
  },
  pending: {
    label: "Ожидает",
    icon: Clock3,
    color: "text-[var(--status-pending)]",
  },
  failed: {
    label: "Ошибка",
    icon: XCircle,
    color: "text-[var(--status-failed)]",
  },
};

const typeLabel = {
  flight: "Перелёт",
  hotel: "Проживание",
  transfer: "Трансфер",
  excursion: "Экскурсия",
};

export function BookingScreen() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const trip = useMftStore((s) => s.trips.find((t) => t.id === id));
  const confirmBookings = useMftStore((s) => s.confirmBookings);

  if (!trip) {
    return (
      <div className="mft-screen">
        <BackHeader title="Бронирование" />
      </div>
    );
  }

  const breakdown = trip.bookings.reduce(
    (acc, b) => {
      acc[b.type] = (acc[b.type] ?? 0) + b.cost;
      return acc;
    },
    {} as Record<string, number>,
  );
  const total =
    trip.bookings.reduce((s, b) => s + b.cost, 0) || trip.totalCost;

  return (
    <div className="mft-scroll mft-screen h-full">
      <BackHeader title="Бронирование" />

      <div className="mft-fade-up rounded-[12px] border border-[var(--accent-gold)]/50 bg-[var(--bg-card)] p-4">
        <div className="text-[12px] text-[var(--text-muted)]">Итого</div>
        <div className="mt-1 text-[28px] font-semibold text-[var(--accent-gold)]">
          ${total.toLocaleString()}
        </div>
        <div className="mt-3 space-y-1.5 border-t border-white/5 pt-3">
          {Object.entries(breakdown).map(([type, cost]) => (
            <div
              key={type}
              className="flex justify-between text-[13px] text-[var(--text-muted)]"
            >
              <span>{typeLabel[type as keyof typeof typeLabel] ?? type}</span>
              <span>${cost.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      <section className="mt-8">
        <SectionLabel>Позиции</SectionLabel>
        <div className="space-y-3">
          {trip.bookings.map((b) => {
            const ui = statusUi[b.status];
            const Icon = ui.icon;
            return (
              <div
                key={b.id}
                className="rounded-[12px] bg-[var(--bg-card)] p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[14px] font-medium">
                      {typeLabel[b.type]} · {b.provider}
                    </div>
                    <div className="mt-1 text-[12px] text-[var(--text-muted)]">
                      {b.details}
                    </div>
                    <div className="mt-1 text-[11px] text-[var(--text-dim)]">
                      {b.reference}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[14px] font-medium">
                      ${b.cost.toLocaleString()}
                    </div>
                    <div
                      className={`mt-1 inline-flex items-center gap-1 text-[11px] ${ui.color}`}
                    >
                      <Icon className="h-3 w-3" />
                      {ui.label}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <SectionLabel>Оплата</SectionLabel>
        <div className="rounded-[12px] bg-[var(--bg-card)] p-4 text-[14px]">
          <div className="font-medium">•••• 4242</div>
          <div className="mt-1 text-[12px] text-[var(--text-muted)]">
            Visa · списание при подтверждении
          </div>
        </div>
      </section>

      <Button
        fullWidth
        className="mt-8"
        onClick={() => {
          confirmBookings(trip.id);
          navigate(`/trip/${trip.id}/countdown`);
        }}
      >
        Подтвердить
      </Button>
      <p className="mt-3 text-center text-[11px] leading-relaxed text-[var(--text-dim)]">
        Бесплатная отмена за 72 часа до вылета. Частичный возврат — по правилам
        поставщиков.
      </p>
    </div>
  );
}
