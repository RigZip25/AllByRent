import { useMediaUrl } from "../../lib/useMediaUrl";
import type { MediaRef } from "../../lib/mediaStore";
import { useMessages } from "../../lib/i18n/react";

function PhotoSlot({
  label,
  media,
  empty,
}: {
  label: string;
  media: MediaRef | null | undefined;
  empty: string;
}) {
  const url = useMediaUrl(media ?? null);
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      {url.url ? (
        <img
          src={url.url}
          alt={label}
          className="h-28 w-full rounded-xl object-cover border border-border"
        />
      ) : (
        <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 px-3 text-center text-xs text-muted-foreground">
          {empty}
        </div>
      )}
    </div>
  );
}

/** Pre/post condition snaps stored on the rental — not listing gallery photos. */
export function RentalConditionPhotos({
  pickupPhoto,
  returnPhoto,
  showReturn = true,
}: {
  pickupPhoto?: MediaRef | null;
  returnPhoto?: MediaRef | null;
  showReturn?: boolean;
}) {
  const t = useMessages();
  const hasAny = Boolean(pickupPhoto) || Boolean(returnPhoto);
  if (!hasAny && !showReturn) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div>
        <h3 className="font-semibold text-foreground">{t.rentalDetail.conditionPhotosTitle}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{t.rentalDetail.conditionPhotosBody}</p>
      </div>
      <div className={`grid gap-3 ${showReturn ? "grid-cols-2" : "grid-cols-1"}`}>
        <PhotoSlot
          label={t.rentalDetail.conditionPhotoPickup}
          media={pickupPhoto}
          empty={t.rentalDetail.conditionPhotoEmpty}
        />
        {showReturn ? (
          <PhotoSlot
            label={t.rentalDetail.conditionPhotoReturn}
            media={returnPhoto}
            empty={t.rentalDetail.conditionPhotoEmpty}
          />
        ) : null}
      </div>
    </div>
  );
}
