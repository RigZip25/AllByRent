import { Star } from "lucide-react";
import { useMemo, useState } from "react";
import { useParams } from "react-router";
import { Button } from "../components/Button";
import { BackHeader } from "../components/Chrome";
import { cn } from "../lib/cn";
import { useMftStore } from "../store";

export function RestaurantsScreen() {
  const { id = "" } = useParams();
  const trip = useMftStore((s) => s.trips.find((t) => t.id === id));
  const [cuisine, setCuisine] = useState("Все");
  const [booked, setBooked] = useState<string | null>(null);

  const restaurants = useMemo(
    () => trip?.restaurants ?? [],
    [trip?.restaurants],
  );
  const cuisines = useMemo(
    () => ["Все", ...Array.from(new Set(restaurants.map((r) => r.cuisine)))],
    [restaurants],
  );
  const filtered =
    cuisine === "Все"
      ? restaurants
      : restaurants.filter((r) => r.cuisine === cuisine);

  return (
    <div className="mft-scroll mft-screen h-full">
      <BackHeader title="Рестораны" />

      <div className="mb-5 flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {cuisines.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCuisine(c)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-[12px]",
              cuisine === c
                ? "bg-[var(--accent-primary)] text-white"
                : "bg-[var(--bg-card)] text-[var(--text-cream)]",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((r) => (
          <div key={r.id} className="overflow-hidden rounded-[12px] bg-[var(--bg-card)]">
            <img src={r.photo} alt="" className="h-36 w-full object-cover" />
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[15px] font-semibold">{r.name}</div>
                  <div className="text-[12px] text-[var(--text-muted)]">
                    {r.cuisine} · {r.distance} · {r.price}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[13px] text-[var(--accent-gold)]">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {r.rating}
                </span>
              </div>
              <Button
                fullWidth
                className="mt-3 h-10 text-[14px]"
                variant={booked === r.id ? "secondary" : "primary"}
                onClick={() => setBooked(r.id)}
              >
                {booked === r.id ? "Забронировано" : "Забронировать"}
              </Button>
            </div>
          </div>
        ))}
        {!filtered.length ? (
          <p className="text-center text-[14px] text-[var(--text-muted)]">
            Нет ресторанов в этой категории
          </p>
        ) : null}
      </div>
    </div>
  );
}
