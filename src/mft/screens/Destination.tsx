import {
  Heart,
  Shield,
  Sun,
  Thermometer,
  FileCheck,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../components/Button";
import { BackHeader } from "../components/Chrome";
import { InfoChip, SectionLabel } from "../components/Ui";
import { getDestination } from "../data/destinations";
import { cn } from "../lib/cn";
import { useMftStore } from "../store";

export function DestinationScreen() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const dest = getDestination(id);
  const wishlist = useMftStore((s) => s.profile.wishlist);
  const toggleWishlist = useMftStore((s) => s.toggleWishlist);
  const addTrip = useMftStore((s) => s.addTrip);

  if (!dest) {
    return (
      <div className="mft-screen">
        <BackHeader title="Не найдено" />
      </div>
    );
  }

  const loved = wishlist.includes(dest.id);

  return (
    <div className="mft-scroll h-full">
      <div className="relative h-56">
        <img
          src={dest.photos[0]}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-black/20 to-black/30" />
        <div className="absolute inset-x-0 top-0 p-4">
          <BackHeader light />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-6">
          <h1 className="text-[28px] font-semibold text-white">{dest.name}</h1>
          <p className="text-[14px] text-white/75">{dest.country}</p>
        </div>
      </div>

      <div className="space-y-8 px-6 pb-10">
        <div className="flex flex-wrap gap-2">
          <InfoChip icon={<Shield className="h-3.5 w-3.5 text-[var(--accent-gold)]" />}>
            Безопасность {dest.safetyRating}
          </InfoChip>
          <InfoChip icon={<FileCheck className="h-3.5 w-3.5 text-[var(--accent-gold)]" />}>
            {dest.visaInfo}
          </InfoChip>
          <InfoChip icon={<Sun className="h-3.5 w-3.5 text-[var(--accent-gold)]" />}>
            {dest.bestSeasons[0]}
          </InfoChip>
          <InfoChip
            icon={<Thermometer className="h-3.5 w-3.5 text-[var(--accent-gold)]" />}
          >
            {dest.temperatureRange}
          </InfoChip>
        </div>

        <section>
          <SectionLabel>Зачем ехать</SectionLabel>
          <div className="space-y-3">
            {dest.highlights.map((h, i) => (
              <div
                key={h}
                className="rounded-[12px] bg-[var(--bg-card)] p-4 text-[14px] leading-relaxed"
              >
                <span className="mr-2 text-[var(--accent-gold)]">0{i + 1}</span>
                {h}
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionLabel>Где жить</SectionLabel>
          <div className="space-y-3">
            {dest.accommodations.map((a) => (
              <div
                key={a.id}
                className="flex gap-3 overflow-hidden rounded-[12px] bg-[var(--bg-card)]"
              >
                <img src={a.photo} alt="" className="h-24 w-24 object-cover" />
                <div className="flex flex-1 flex-col justify-center py-2 pr-3">
                  <div className="text-[14px] font-medium">{a.name}</div>
                  <div className="text-[12px] text-[var(--text-muted)]">{a.type}</div>
                  <div className="mt-1 text-[14px] text-[var(--accent-gold)]">
                    ${a.pricePerNight}
                    <span className="text-[12px] text-[var(--text-muted)]"> / ночь</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-3">
          <Button
            fullWidth
            onClick={() => {
              const tripId = addTrip(dest.id);
              navigate(`/trip/${tripId}`);
            }}
          >
            Создать трип
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => toggleWishlist(dest.id)}
            className={cn(loved && "border-[var(--accent-gold)] text-[var(--accent-gold)]")}
          >
            <Heart
              className="h-4 w-4"
              fill={loved ? "currentColor" : "none"}
            />
            {loved ? "В мечтах" : "В мечты"}
          </Button>
        </div>
      </div>
    </div>
  );
}
