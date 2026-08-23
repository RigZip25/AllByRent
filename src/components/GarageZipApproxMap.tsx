import { useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { BRAND_GREEN } from "../lib/brand";
import { hashUnitInterval } from "../lib/garageIdentity";
import { searchPlaces } from "../lib/geocoding";

const BORDER = "#E8E6E0";
const GREEN = BRAND_GREEN;

export type GarageMapPin = {
  id: string;
  name: string;
  neighborhood?: string;
  openNow?: boolean;
};

type Props = {
  areaLabel: string;
  pins: GarageMapPin[];
  onSelect: (id: string) => void;
  approxHint: string;
  emptyLabel: string;
};

/**
 * Approximate ZIP/city map — one area blob, pins jittered so same-street garages
 * cluster without revealing exact addresses.
 */
export function GarageZipApproxMap({
  areaLabel,
  pins,
  onSelect,
  approxHint,
  emptyLabel,
}: Props) {
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const q = areaLabel.trim();
    if (!q) {
      setCenter(null);
      return;
    }
    void searchPlaces(q, { granularity: "area" }).then((hits) => {
      if (!mounted) return;
      const first = hits[0];
      if (first && Number.isFinite(first.lat) && Number.isFinite(first.lng)) {
        setCenter({ lat: first.lat, lng: first.lng });
      } else {
        setCenter(null);
      }
    });
    return () => {
      mounted = false;
    };
  }, [areaLabel]);

  const laidOut = useMemo(() => {
    return pins.map((pin, index) => {
      const a = hashUnitInterval(`${pin.id}:x`);
      const b = hashUnitInterval(`${pin.id}:y`);
      // Keep pins inside the soft “neighborhood” ring (avoid edges / exact center).
      const angle = a * Math.PI * 2;
      const radius = 18 + b * 28;
      const left = 50 + Math.cos(angle) * radius;
      const top = 48 + Math.sin(angle) * radius * 0.72;
      return {
        ...pin,
        left: Math.min(88, Math.max(12, left)),
        top: Math.min(82, Math.max(18, top)),
        z: index + 1,
      };
    });
  }, [pins]);

  const selected = laidOut.find((p) => p.id === selectedId) ?? null;

  // ~0.04° ~ 3–4 km box around ZIP centroid — intentional blur.
  const delta = 0.045;
  const bbox = center
    ? {
        west: center.lng - delta * 1.35,
        south: center.lat - delta,
        east: center.lng + delta * 1.35,
        north: center.lat + delta,
      }
    : null;
  const embedSrc = bbox
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.west}%2C${bbox.south}%2C${bbox.east}%2C${bbox.north}&layer=mapnik&marker=${center!.lat}%2C${center!.lng}`
    : null;

  return (
    <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: BORDER }}>
      <div className="relative h-[240px] w-full overflow-hidden bg-[#E8F0EA]">
        {embedSrc ? (
          <iframe
            title={areaLabel || "Area map"}
            src={embedSrc}
            className="pointer-events-none absolute inset-0 h-[120%] w-full -translate-y-[8%] border-0 opacity-90"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 45%, #C8E6D4 0%, #E8F0EA 55%, #D5E0D8 100%)",
            }}
          />
        )}

        {/* Soft privacy veil — hides sharp street detail under pins */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 48%, rgba(255,255,255,0.15) 0%, rgba(240,247,242,0.55) 70%)",
          }}
        />

        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[58%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed"
          style={{ borderColor: `${GREEN}66`, backgroundColor: `${GREEN}14` }}
          aria-hidden
        />

        {laidOut.length === 0 ? (
          <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-[14px] font-semibold text-gray-600">
            {emptyLabel}
          </p>
        ) : (
          laidOut.map((pin) => (
            <button
              key={pin.id}
              type="button"
              onClick={() => {
                setSelectedId(pin.id);
                onSelect(pin.id);
              }}
              className="absolute -translate-x-1/2 -translate-y-full rounded-full border-2 border-white px-2 py-1 text-[11px] font-bold text-white shadow-md"
              style={{
                left: `${pin.left}%`,
                top: `${pin.top}%`,
                zIndex: selectedId === pin.id ? 30 : pin.z,
                backgroundColor: pin.openNow ? "#B45309" : GREEN,
                maxWidth: "42%",
              }}
              title={pin.name}
            >
              <span className="block truncate">{pin.name}</span>
            </button>
          ))
        )}
      </div>

      <div className="border-t px-3 py-2.5" style={{ borderColor: BORDER }}>
        <p className="flex items-center gap-1.5 text-[13px] font-bold text-gray-900">
          <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: GREEN }} aria-hidden />
          {areaLabel.trim() || "Nearby"}
        </p>
        <p className="mt-0.5 text-[12px] leading-snug text-gray-500">{approxHint}</p>
        {selected ? (
          <p className="mt-1.5 text-[12px] font-semibold" style={{ color: GREEN }}>
            {selected.name}
            {selected.neighborhood ? ` · ${selected.neighborhood}` : ""}
          </p>
        ) : null}
      </div>
    </div>
  );
}
