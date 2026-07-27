import { Star } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../components/Button";
import { BackHeader } from "../components/Chrome";
import { AiCard, SectionLabel } from "../components/Ui";
import { useMftStore } from "../store";

export function SummaryScreen() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const trip = useMftStore((s) => s.trips.find((t) => t.id === id));
  const setTripStatus = useMftStore((s) => s.setTripStatus);
  const [rating, setRating] = useState(5);

  if (!trip) {
    return (
      <div className="mft-screen">
        <BackHeader title="Итоги" />
      </div>
    );
  }

  const stats = trip.stats ?? { days: 6, cities: 2, km: 210, photos: 84 };
  const highlights =
    trip.highlights.length > 0
      ? trip.highlights
      : [
          "Закат на дюнах без единого лишнего звука",
          "Купольный люкс и Млечный Путь над головой",
          "Ужин у костра с местными хозяевами",
        ];
  const collage =
    trip.photos.length > 0
      ? trip.photos.slice(0, 4).map((p) => p.url)
      : [trip.heroPhoto, trip.itinerary[0]?.photo, trip.itinerary[1]?.photo, trip.itinerary[2]?.photo].filter(
          Boolean,
        ) as string[];

  return (
    <div className="mft-scroll mft-screen h-full">
      <BackHeader title="Итоги" />

      <h1 className="mft-fade-up text-center text-[12px] font-semibold tracking-[0.16em] text-[var(--accent-gold)] uppercase">
        Путешествие завершено
      </h1>
      <p className="mt-2 text-center text-[20px] font-semibold">{trip.title}</p>

      <div className="mt-6 grid grid-cols-2 gap-2">
        {collage.map((url, i) => (
          <img
            key={`${url}-${i}`}
            src={url}
            alt=""
            className="h-28 w-full rounded-[12px] object-cover"
          />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-4 gap-2 text-center">
        {[
          [stats.days, "дней"],
          [stats.cities, "городов"],
          [stats.km, "км"],
          [stats.photos, "фото"],
        ].map(([v, l]) => (
          <div key={String(l)} className="rounded-[12px] bg-[var(--bg-card)] py-3">
            <div className="text-[18px] font-semibold text-[var(--accent-gold)]">
              {v}
            </div>
            <div className="text-[10px] text-[var(--text-muted)]">{l}</div>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <SectionLabel>Моменты</SectionLabel>
        <div className="space-y-2">
          {highlights.map((h) => (
            <div key={h} className="rounded-[12px] bg-[var(--bg-card)] p-4 text-[14px]">
              {h}
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            aria-label={`${n} звёзд`}
          >
            <Star
              className="h-7 w-7"
              fill={n <= rating ? "var(--accent-gold)" : "none"}
              stroke="var(--accent-gold)"
            />
          </button>
        ))}
      </div>

      <AiCard className="mt-6">
        Ваш профиль обновлён: сильнее тянет к созерцательным пустынным маршрутам и
        luxury lodges. Следующая рекомендация — Намиб.
      </AiCard>

      <div className="mt-8 flex flex-col gap-3">
        <Button
          fullWidth
          onClick={async () => {
            if (navigator.share) {
              try {
                await navigator.share({
                  title: trip.title,
                  text: `Моё путешествие: ${trip.title}`,
                });
              } catch {
                /* ignore */
              }
            }
          }}
        >
          Поделиться
        </Button>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => {
            setTripStatus(trip.id, "completed");
            navigate("/trip/create");
          }}
        >
          Новое путешествие
        </Button>
        <Button
          variant="text"
          onClick={() => navigate(`/trip/${trip.id}/memories`)}
        >
          Открыть воспоминания →
        </Button>
      </div>
    </div>
  );
}
