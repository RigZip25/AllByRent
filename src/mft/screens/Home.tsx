import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { DestinationCard, TripCardHero, TripCardSmall } from "../components/Cards";
import { Wordmark } from "../components/Chrome";
import { TabBar } from "../components/TabBar";
import { DESTINATIONS } from "../data/destinations";
import { useMftStore } from "../store";

function formatRange(start: string, end: string) {
  try {
    return `${format(parseISO(start), "d MMM", { locale: ru })} – ${format(parseISO(end), "d MMM", { locale: ru })}`;
  } catch {
    return `${start} – ${end}`;
  }
}

export function HomeScreen() {
  const profile = useMftStore((s) => s.profile);
  const trips = useMftStore((s) => s.trips);
  const upcoming = trips.filter((t) => t.status !== "completed");
  const hero = upcoming[0];
  const secondary = upcoming[1];
  const gems = DESTINATIONS.slice(0, 3);
  const name = profile.name || "Путешественник";

  return (
    <div className="relative flex h-full flex-col">
      <div className="mft-scroll mft-screen with-tabs">
        <header className="mb-6 flex items-center justify-between">
          <Wordmark size="sm" />
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-amber-soft)] text-[13px] font-semibold text-[var(--accent-gold)]">
            {name.slice(0, 1).toUpperCase()}
          </div>
        </header>

        <h1 className="mft-fade-up text-[24px] font-semibold tracking-tight">
          {name}, куда дальше?
        </h1>

        <div className="mft-fade-up mft-fade-up-delay-1 mt-5 space-y-3">
          {hero ? (
            <TripCardHero
              to={`/trip/${hero.id}`}
              photo={hero.heroPhoto}
              title={hero.title}
              subtitle={formatRange(hero.startDate, hero.endDate)}
              badge="Ближайшее"
            />
          ) : null}
          {secondary ? (
            <TripCardSmall
              to={`/trip/${secondary.id}`}
              photo={secondary.heroPhoto}
              title={secondary.title}
              subtitle={formatRange(secondary.startDate, secondary.endDate)}
            />
          ) : null}
        </div>

        <section className="mft-fade-up mft-fade-up-delay-2 mt-8">
          <h2 className="mb-3 text-[16px] font-semibold">Жемчужины сезона</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {gems.map((d) => (
              <DestinationCard
                key={d.id}
                to={`/destination/${d.id}`}
                photo={d.photos[0]}
                name={d.name}
                badge={d.seasonBadge}
              />
            ))}
          </div>
        </section>
      </div>
      <TabBar />
    </div>
  );
}
