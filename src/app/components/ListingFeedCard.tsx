import { Heart, QrCode, Shield, Star } from "lucide-react";
import { DEPOSIT_PROTECTION_LABEL } from "../../lib/brand";
import type { MediaRef } from "../../lib/mediaStore";
import { useCoverMediaUrl } from "../../lib/useMediaUrl";

type OfferType = "Rent" | "Buy" | "Gift";

export function offerTypeFromModes(modes: {
  rent: boolean;
  sell: boolean;
  rentToOwn: boolean;
  gift: boolean;
}): OfferType {
  if (modes.gift) return "Gift";
  if (modes.sell) return "Buy";
  return "Rent";
}

export function ListingFeedCard({
  title,
  price,
  rating,
  reviews,
  distance,
  cover,
  offerType,
  itemHeavy,
  onSelect,
  showFavoriteAction = true,
}: {
  title: string;
  price: string;
  rating: number;
  reviews: number;
  distance: string;
  cover?: MediaRef | null;
  offerType: OfferType | string;
  itemHeavy?: boolean;
  onSelect?: () => void;
  showFavoriteAction?: boolean;
}) {
  const offerColors: Record<string, string> = {
    Rent: "bg-primary",
    Buy: "bg-blue-500",
    Gift: "bg-accent",
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all text-left"
      disabled={!onSelect}
    >
      <div className="relative aspect-square bg-[#F0F4F2] overflow-hidden">
        <CoverThumb cover={cover} />

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <div className="bg-primary/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md flex items-center gap-1 w-fit">
            <Shield className="w-3 h-3" />
            <span>{DEPOSIT_PROTECTION_LABEL}</span>
          </div>
          {itemHeavy ? (
            <span className="rounded-md bg-amber-500/95 px-2 py-0.5 text-[10px] font-semibold text-white w-fit">
              Heavy
            </span>
          ) : null}
        </div>

        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-md">
          <QrCode className="w-4 h-4 text-foreground" />
        </div>

        {showFavoriteAction ? (
          <span
            className="absolute top-10 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-md"
            aria-hidden
          >
            <Heart className="w-4 h-4 text-foreground" />
          </span>
        ) : null}
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-sm line-clamp-2 flex-1">{title}</h3>
          <span className="text-sm font-bold text-primary ml-2">
            {price ? `$${price}/day` : "—"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <div className="flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-accent text-accent" />
            <span className="font-medium text-foreground">{rating}</span>
            <span>({reviews})</span>
          </div>
          <span>·</span>
          <span>{distance}</span>
        </div>

        <div
          className={`${
            offerColors[offerType] || "bg-primary"
          } text-white text-xs px-2 py-1 rounded-md inline-block`}
        >
          {offerType}
        </div>
      </div>
    </button>
  );
}

function CoverThumb({ cover }: { cover?: MediaRef | null }) {
  const { url, status } = useCoverMediaUrl(cover ?? null);
  if (url) {
    return <img src={url} alt="" className="absolute inset-0 h-full w-full object-cover" />;
  }
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
      <span aria-hidden className="text-2xl">
        📷
      </span>
      <span className="text-xs text-muted-foreground">
        {status === "loading" ? "Loading…" : "Photo by owner"}
      </span>
    </div>
  );
}

