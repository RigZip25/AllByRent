import { useState } from "react";
import { MapPin, Gauge, AlertTriangle } from "lucide-react";
import { analyzeVehicleTrail } from "../../lib/vehicleMacropoints";
import { updateBooking, type RentalBooking } from "../../lib/rentalsStorage";
import { formatTollHoldUsd } from "../../lib/vehicleTollHold";
import { useMessages } from "../../lib/i18n/react";

const GREEN = "#0D5C3A";

/** Light host/renter view of macropoints, toll flags, and soft speeding signals. */
export function VehicleTrailPanel({
  booking,
  role,
  onUpdated,
}: {
  booking: RentalBooking;
  role: "host" | "renter";
  onUpdated?: () => void;
}) {
  const t = useMessages();
  const copy = t.rentalDetail;
  const insights = analyzeVehicleTrail(booking);
  const [message, setMessage] = useState<string | null>(null);

  const points = booking.macropoints ?? [];
  if (!points.length && !booking.tollHoldAmountCents && !booking.homeTerritoryBreachSuspect) {
    return null;
  }

  const last = insights.lastPoint;
  const mapsUrl = last
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${last.lat},${last.lng}`)}`
    : null;

  const canFlagToll =
    role === "host" &&
    Boolean(booking.tollSuspect || (booking.tollHoldAmountCents ?? 0) >= 50) &&
    booking.tollHoldClaimStatus !== "claimed" &&
    booking.tollHoldClaimStatus !== "flagged";

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4" style={{ color: GREEN }} aria-hidden />
        <h3 className="font-semibold">{copy.macropointTitle}</h3>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{copy.macropointBody}</p>

      {last ? (
        <div className="rounded-lg bg-muted p-3 text-sm">
          <p className="font-medium">
            {copy.macropointLastKnown(new Date(last.at).toLocaleString())}
          </p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {last.lat.toFixed(4)}, {last.lng.toFixed(4)}
            {last.speedMph != null ? ` · ~${last.speedMph} mph` : ""}
          </p>
          {mapsUrl ? (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
            >
              {copy.openInMaps}
            </a>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{copy.macropointEmpty}</p>
      )}

      {points.length > 0 ? (
        <ul className="max-h-40 space-y-1 overflow-y-auto text-[12px] text-gray-600">
          {[...points]
            .reverse()
            .slice(0, 12)
            .map((p) => (
              <li key={`${p.at}-${p.lat}`} className="flex justify-between gap-2">
                <span>{new Date(p.at).toLocaleString()}</span>
                <span className="font-mono shrink-0">
                  {p.lat.toFixed(3)}, {p.lng.toFixed(3)}
                  {p.speedMph != null ? ` · ${p.speedMph}mph` : ""}
                </span>
              </li>
            ))}
        </ul>
      ) : null}

      {insights.toll.suspect ? (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <div>
            <p className="font-semibold">{copy.tollSuspectTitle}</p>
            <p className="mt-1 text-xs leading-snug">{copy.tollSuspectBody}</p>
            {insights.toll.labels.length ? (
              <p className="mt-1 text-xs">{insights.toll.labels.join(" · ")}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {insights.homeTerritoryBreach || booking.homeTerritoryBreachSuspect ? (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <div>
            <p className="font-semibold">{copy.homeTerritoryBreachTitle}</p>
            <p className="mt-1 text-xs leading-snug">{copy.homeTerritoryBreachBody}</p>
            {booking.homeTerritory?.label ? (
              <p className="mt-1 text-xs">
                {booking.travelOutsideHomeArea === "forbidden"
                  ? copy.travelOutsideListingForbidden(
                      `${booking.homeTerritory.label}${
                        booking.homeTerritory.kind === "state"
                          ? " (US state)"
                          : " (country)"
                      }`,
                    )
                  : null}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {insights.speedSignals.length > 0 ? (
        <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/60 p-3 text-sm">
          <Gauge className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <div>
            <p className="font-semibold">{copy.speedSoftTitle}</p>
            <p className="mt-1 text-xs text-muted-foreground">{copy.speedSoftBody}</p>
            <ul className="mt-1 space-y-0.5 text-xs">
              {insights.speedSignals.map((s) => (
                <li key={`${s.toAt}-${s.speedMph}`}>
                  {copy.speedSoftSegment(s.speedMph, new Date(s.toAt).toLocaleString())}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {(booking.tollHoldAmountCents ?? 0) >= 50 ? (
        <p className="text-xs text-muted-foreground">
          {copy.tollHoldOnBooking(formatTollHoldUsd(booking.tollHoldAmountCents ?? 0))}
        </p>
      ) : null}

      {booking.tollHoldClaimStatus === "flagged" || booking.tollHoldClaimStatus === "claimed" ? (
        <p className="text-xs font-medium text-amber-900">{copy.tollFlagged}</p>
      ) : null}

      {canFlagToll ? (
        <button
          type="button"
          className="w-full rounded-xl py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: GREEN }}
          onClick={() => {
            updateBooking(booking.id, {
              tollHoldClaimStatus: "flagged",
              tollHoldClaimedAt: new Date().toISOString(),
            });
            setMessage(copy.tollFlagged);
            onUpdated?.();
          }}
        >
          {copy.tollClaimCta(formatTollHoldUsd(booking.tollHoldAmountCents ?? 0))}
        </button>
      ) : null}
      {message ? <p className="text-xs text-gray-700">{message}</p> : null}
    </div>
  );
}
