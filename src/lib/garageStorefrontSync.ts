import {
  normalizeGarageIdentity,
  type GarageIdentity,
} from "./garageIdentity";
import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";

const GARAGE_IDENTITY_EVENT = "allbyrent:garage-identity";

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function emitGarageIdentityChanged(identity: GarageIdentity): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(
      new CustomEvent(GARAGE_IDENTITY_EVENT, { detail: identity }),
    );
  } catch {
    /* ignore */
  }
}

export function onGarageIdentityChanged(
  listener: (identity: GarageIdentity) => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;
  const handler = (event: Event) => {
    const detail = (event as CustomEvent<GarageIdentity>).detail;
    if (detail) listener(normalizeGarageIdentity(detail));
  };
  window.addEventListener(GARAGE_IDENTITY_EVENT, handler);
  return () => window.removeEventListener(GARAGE_IDENTITY_EVENT, handler);
}

/** Persist host garage look for neighbors (no-op if table/session missing). */
export async function pushGarageStorefrontRemote(
  hostId: string | null | undefined,
  identity: GarageIdentity,
): Promise<void> {
  const id = hostId?.trim() ?? "";
  if (!id || !isUuid(id) || !isSupabaseConfigured()) return;
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const normalized = normalizeGarageIdentity(identity);
  await supabase.from("garage_storefronts").upsert({
    host_id: id,
    shop_kind: normalized.shopKind,
    accent_id: normalized.accentId,
    shop_name: normalized.shopName,
    updated_at: new Date().toISOString(),
  });
}

export async function fetchGarageStorefrontsByHostIds(
  hostIds: string[],
): Promise<Record<string, GarageIdentity>> {
  const ids = [...new Set(hostIds.map((id) => id.trim()).filter(isUuid))];
  if (ids.length === 0 || !isSupabaseConfigured()) return {};
  const supabase = getSupabaseClient();
  if (!supabase) return {};
  const { data, error } = await supabase
    .from("garage_storefronts")
    .select("host_id, shop_kind, accent_id, shop_name")
    .in("host_id", ids);
  if (error || !data) return {};
  const out: Record<string, GarageIdentity> = {};
  for (const row of data) {
    const hostId = typeof row.host_id === "string" ? row.host_id : "";
    if (!hostId) continue;
    out[hostId] = normalizeGarageIdentity({
      shopKind: row.shop_kind,
      accentId: row.accent_id,
      shopName: row.shop_name,
    });
  }
  return out;
}

export async function fetchGarageStorefrontRemote(
  hostId: string,
): Promise<GarageIdentity | null> {
  const map = await fetchGarageStorefrontsByHostIds([hostId]);
  return map[hostId.trim()] ?? null;
}
