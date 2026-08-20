/**
 * Best-effort toll-road corridor detection from coarse macropoints.
 *
 * Honest v1: coarse bounding boxes for well-known US toll corridors — not
 * billing-grade. Plate bills often arrive days later; GPS only supports a hold.
 */

export type TollCorridor = {
  id: string;
  label: string;
  south: number;
  north: number;
  west: number;
  east: number;
};

export const KNOWN_TOLL_CORRIDORS: TollCorridor[] = [
  { id: "nj-turnpike", label: "NJ Turnpike corridor", south: 39.4, north: 40.95, west: -75.0, east: -74.35 },
  { id: "garden-state", label: "Garden State Parkway corridor", south: 39.0, north: 41.1, west: -74.55, east: -73.9 },
  { id: "pa-turnpike", label: "PA Turnpike corridor", south: 39.85, north: 40.55, west: -80.55, east: -75.0 },
  { id: "nyc-bridges", label: "NYC bridges / tunnels area", south: 40.55, north: 40.92, west: -74.1, east: -73.7 },
  { id: "chicago-skyway", label: "Chicago Skyway / IL toll area", south: 41.6, north: 41.9, west: -87.75, east: -87.4 },
  { id: "golden-gate", label: "Golden Gate / Bay Area toll bridges", south: 37.4, north: 37.95, west: -122.55, east: -122.0 },
  { id: "miami-express", label: "South Florida express / toll corridors", south: 25.5, north: 26.5, west: -80.45, east: -80.05 },
  { id: "dfw-tollways", label: "DFW tollway corridors", south: 32.55, north: 33.15, west: -97.2, east: -96.55 },
  { id: "houston-toll", label: "Houston tollway corridors", south: 29.5, north: 30.1, west: -95.75, east: -95.1 },
];

export type TollCorridorHit = {
  suspect: boolean;
  corridorIds: string[];
  labels: string[];
};

function pointInCorridor(lat: number, lng: number, c: TollCorridor): boolean {
  return lat >= c.south && lat <= c.north && lng >= c.west && lng <= c.east;
}

export function assessTollCorridors(
  points: Array<{ lat: number; lng: number }>,
): TollCorridorHit {
  const hitIds = new Set<string>();
  const labels: string[] = [];
  for (const p of points) {
    if (!Number.isFinite(p.lat) || !Number.isFinite(p.lng)) continue;
    for (const c of KNOWN_TOLL_CORRIDORS) {
      if (hitIds.has(c.id)) continue;
      if (pointInCorridor(p.lat, p.lng, c)) {
        hitIds.add(c.id);
        labels.push(c.label);
      }
    }
  }
  const corridorIds = [...hitIds];
  return { suspect: corridorIds.length > 0, corridorIds, labels };
}

export function tollApiConfigured(): boolean {
  return Boolean(String(import.meta.env.VITE_TOLLGURU_API_KEY ?? "").trim());
}
