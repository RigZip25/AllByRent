import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { useNavigate, useParams } from "react-router";
import { Button } from "../components/Button";
import { BackHeader } from "../components/Chrome";
import { InfoChip, SectionLabel } from "../components/Ui";
import { useMftStore } from "../store";

export function TripOverviewScreen() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const trip = useMftStore((s) => s.trips.find((t) => t.id === id));

  if (!trip) {
    return (
      <div className="mft-screen">
        <BackHeader title="Трип не найден" />
      </div>
    );
  }

  const range = `${format(parseISO(trip.startDate), "d MMM", { locale: ru })} – ${format(parseISO(trip.endDate), "d MMM", { locale: ru })}`;

  return (
    <div className="mft-scroll h-full">
      <div className="relative h-56">
        <img
          src={trip.heroPhoto}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-black/25 to-black/35" />
        <div className="absolute inset-x-0 top-0 p-4">
          <BackHeader light />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-6">
          <h1 className="text-[24px] font-semibold text-white">{trip.title}</h1>
        </div>
      </div>

      <div className="space-y-8 px-6 pb-10">
        <div className="flex flex-wrap gap-2">
          <InfoChip>{range}</InfoChip>
          <InfoChip>{trip.participantCount} чел.</InfoChip>
          <InfoChip className="text-[var(--accent-gold)]">
            ${trip.totalCost.toLocaleString()}
          </InfoChip>
        </div>

        <section>
          <SectionLabel>Маршрут</SectionLabel>
          <div className="relative ml-2 space-y-0 border-l-2 border-[var(--accent-gold)]/40 pl-6">
            {trip.itinerary.map((stop, i) => (
              <div key={stop.id} className="relative pb-6 last:pb-0">
                <span className="absolute top-1 -left-[31px] h-3.5 w-3.5 rounded-full border-2 border-[var(--accent-gold)] bg-[var(--bg-primary)]" />
                <div className="overflow-hidden rounded-[12px] bg-[var(--bg-card)]">
                  <img
                    src={stop.photo}
                    alt=""
                    className="h-28 w-full object-cover"
                  />
                  <div className="p-3">
                    <div className="text-[11px] text-[var(--accent-gold)]">
                      День {stop.dayNumber}
                    </div>
                    <div className="text-[15px] font-medium">{stop.location}</div>
                    <div className="mt-1 text-[12px] text-[var(--text-muted)]">
                      {stop.accommodation}
                    </div>
                    <ul className="mt-2 space-y-1 text-[12px] text-[var(--text-cream)]/80">
                      {stop.activities.map((a) => (
                        <li key={a}>· {a}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                {i === trip.itinerary.length - 1 ? null : null}
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-3">
          <Button fullWidth onClick={() => navigate(`/trip/${trip.id}/booking`)}>
            Забронировать всё
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate("/trip/create")}
          >
            Изменить план
          </Button>
          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              ["Сборы", "packing"],
              ["Группа", "group"],
              ["Отсчёт", "countdown"],
            ].map(([label, path]) => (
              <Button
                key={path}
                variant="ghost"
                className="h-10 text-[12px] !px-2"
                onClick={() => navigate(`/trip/${trip.id}/${path}`)}
              >
                {label}
              </Button>
            ))}
          </div>
          {(trip.status === "preparing" || trip.status === "booked" || trip.status === "live") && (
            <Button
              variant="text"
              onClick={() => navigate(`/trip/${trip.id}/live`)}
            >
              Открыть Live Day →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
