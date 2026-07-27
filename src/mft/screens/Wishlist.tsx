import { Heart } from "lucide-react";
import { Link } from "react-router";
import { DestinationCard } from "../components/Cards";
import { Wordmark } from "../components/Chrome";
import { TabBar } from "../components/TabBar";
import { DESTINATIONS } from "../data/destinations";
import { useMftStore } from "../store";

export function WishlistScreen() {
  const wishlist = useMftStore((s) => s.profile.wishlist);
  const items = DESTINATIONS.filter((d) => wishlist.includes(d.id));

  return (
    <div className="relative flex h-full flex-col">
      <div className="mft-scroll mft-screen with-tabs">
        <header className="mb-6 flex items-center justify-between">
          <Wordmark size="sm" />
          <Heart className="h-5 w-5 text-[var(--accent-gold)]" fill="currentColor" />
        </header>
        <h1 className="text-[24px] font-semibold">Мечты</h1>
        <p className="mt-1 text-[13px] text-[var(--text-muted)]">
          Направления, которые вы сохранили
        </p>

        {items.length ? (
          <div className="mt-6 flex flex-wrap gap-3">
            {items.map((d) => (
              <DestinationCard
                key={d.id}
                to={`/destination/${d.id}`}
                photo={d.photos[0]}
                name={d.name}
                badge={d.country}
                className="!w-[calc(50%-6px)] !h-48"
              />
            ))}
          </div>
        ) : (
          <div className="mt-16 text-center">
            <p className="text-[14px] text-[var(--text-muted)]">
              Пока пусто. Откройте карту мира и сохраните жемчужину.
            </p>
            <Link
              to="/explore"
              className="mt-4 inline-block text-[14px] text-[var(--accent-gold)]"
            >
              К карте →
            </Link>
          </div>
        )}
      </div>
      <TabBar />
    </div>
  );
}
