import { differenceInCalendarDays, parseISO } from "date-fns";
import { useNavigate, useParams } from "react-router";
import { Button } from "../components/Button";
import { BackHeader } from "../components/Chrome";
import { AiCard, ProgressBar, SectionLabel } from "../components/Ui";
import { useMftStore } from "../store";

export function CountdownScreen() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const trip = useMftStore((s) => s.trips.find((t) => t.id === id));
  const setTripStatus = useMftStore((s) => s.setTripStatus);

  if (!trip) {
    return (
      <div className="mft-screen">
        <BackHeader title="Отсчёт" />
      </div>
    );
  }

  const days = Math.max(
    0,
    differenceInCalendarDays(parseISO(trip.startDate), new Date()),
  );
  const bookingsDone =
    trip.bookings.length === 0
      ? 100
      : Math.round(
          (trip.bookings.filter((b) => b.status === "confirmed").length /
            trip.bookings.length) *
            100,
        );
  const packingDone = trip.packing.length
    ? Math.round(
        (trip.packing.filter((p) => p.checked).length / trip.packing.length) *
          100,
      )
    : 0;
  const docs = trip.packing.filter((p) => p.category === "documents");
  const docsDone = docs.length
    ? Math.round((docs.filter((p) => p.checked).length / docs.length) * 100)
    : 50;
  const vaccines = 75;

  const readiness = [
    { label: "Бронирования", value: bookingsDone },
    { label: "Сборы", value: packingDone },
    { label: "Документы", value: docsDone },
    { label: "Прививки", value: vaccines },
  ];

  return (
    <div className="mft-scroll mft-screen h-full">
      <BackHeader title="До вылета" />

      <div className="mft-count-in py-8 text-center">
        <div className="text-[72px] leading-none font-semibold text-[var(--accent-gold)]">
          {days}
        </div>
        <div className="mt-2 text-[14px] tracking-wide text-[var(--text-muted)] uppercase">
          {days === 1 ? "день" : days < 5 ? "дня" : "дней"}
        </div>
        <p className="mt-3 text-[15px] text-[var(--text-cream)]">{trip.title}</p>
      </div>

      <section className="mb-8">
        <SectionLabel>Готовность</SectionLabel>
        <div className="space-y-4">
          {readiness.map((r) => (
            <div key={r.label}>
              <div className="mb-1.5 flex justify-between text-[13px]">
                <span>{r.label}</span>
                <span className="text-[var(--accent-gold)]">{r.value}%</span>
              </div>
              <ProgressBar value={r.value} />
            </div>
          ))}
        </div>
      </section>

      <AiCard>
        <p className="text-[12px] text-[var(--accent-gold)]">AI · дедлайн</p>
        <p className="mt-1">
          {trip.aiTip ??
            "Проверьте визовые правила и страховку за 7 дней до вылета."}
        </p>
      </AiCard>

      <div className="mt-8 flex flex-col gap-3">
        <Button
          fullWidth
          onClick={() => {
            setTripStatus(trip.id, "live");
            navigate(`/trip/${trip.id}/live`);
          }}
        >
          Начать Live Day
        </Button>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => navigate(`/trip/${trip.id}/packing`)}
        >
          К сборам
        </Button>
      </div>
    </div>
  );
}
