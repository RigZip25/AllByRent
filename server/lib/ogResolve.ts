import { getAdminClient } from "./passkey/supabaseAdmin";
import { APP_NAME } from "./brand";
import { buildRequestShareCopy } from "./requestShareCopy";

type ListingRow = {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  pricing: unknown;
  modes: string[] | null;
  listing_status: string;
  city?: string | null;
  photos?: unknown;
};

type ProfileRow = {
  display_name: string | null;
};

export type OgShareContext = {
  title: string;
  description: string;
  badge: string;
  priceLabel: string;
  imageParams: Record<string, string>;
  appQuery: URLSearchParams;
};

function escapeParam(value: string): string {
  return value.trim().slice(0, 160);
}

function readSalePrice(pricing: unknown): number | null {
  if (!pricing || typeof pricing !== "object") return null;
  const raw = (pricing as Record<string, unknown>).salePrice;
  if (typeof raw === "string" || typeof raw === "number") {
    const parsed = Number.parseFloat(String(raw).replace(/[^0-9.]/g, ""));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }
  return null;
}

function readDailyRate(pricing: unknown): string | null {
  if (!pricing || typeof pricing !== "object") return null;
  const raw = (pricing as Record<string, unknown>).dailyRate;
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  return null;
}

function supabasePublicOrigin(): string | null {
  const raw = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
  if (!raw) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return url.origin.replace(/\/$/, "");
  } catch {
    return null;
  }
}

/** First listing photo suitable for OG cards (public storage URL). */
function listingCoverPhotoUrl(photos: unknown): string | null {
  if (!Array.isArray(photos) || photos.length === 0) return null;
  const origin = supabasePublicOrigin();
  if (!origin) return null;
  for (const entry of photos) {
    if (!entry || typeof entry !== "object") continue;
    const row = entry as Record<string, unknown>;
    const path =
      (typeof row.thumbStoragePath === "string" && row.thumbStoragePath.trim()) ||
      (typeof row.storagePath === "string" && row.storagePath.trim()) ||
      "";
    if (!path) continue;
    return `${origin}/storage/v1/object/public/listing-photos/${path.replace(/^\/+/, "")}`;
  }
  return null;
}

async function fetchListing(id: string): Promise<ListingRow | null> {
  const admin = getAdminClient();
  if (!admin) return null;
  const { data, error } = await admin.from("listings").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data as ListingRow;
}

async function fetchProfileName(hostId: string): Promise<string | null> {
  const admin = getAdminClient();
  if (!admin) return null;
  const { data, error } = await admin
    .from("profiles")
    .select("display_name")
    .eq("id", hostId)
    .maybeSingle();
  if (error || !data) return null;
  return (data as ProfileRow).display_name?.trim() || null;
}

async function countActiveShelfItems(hostId: string): Promise<number> {
  const admin = getAdminClient();
  if (!admin) return 0;
  const { count, error } = await admin
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", hostId)
    .eq("listing_status", "active")
    .contains("modes", ["sell"]);
  if (error) return 0;
  return count ?? 0;
}

/** First active sell listing cover photo for garage OG cards. */
async function fetchGarageCoverPhoto(hostId: string): Promise<string | null> {
  const admin = getAdminClient();
  if (!admin) return null;
  const { data, error } = await admin
    .from("listings")
    .select("photos")
    .eq("owner_id", hostId)
    .eq("listing_status", "active")
    .contains("modes", ["sell"])
    .order("created_at", { ascending: false })
    .limit(8);
  if (error || !Array.isArray(data)) return null;
  for (const row of data) {
    const photo = listingCoverPhotoUrl((row as { photos?: unknown }).photos);
    if (photo) return photo;
  }
  return null;
}

function garageFallbackName(hostId: string): string {
  if (!hostId || hostId === "demo-user") return "Neighbor's garage";
  return "Garage sale";
}

type RequestRow = {
  id: string;
  category?: string | null;
  subcategory: string;
  description: string;
  location_label: string;
  start_date?: string | null;
  end_date?: string | null;
};

async function fetchRequest(id: string): Promise<RequestRow | null> {
  const admin = getAdminClient();
  if (!admin) return null;
  const { data, error } = await admin.from("requests").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data as RequestRow;
}

export async function resolveOgShareContext(input: {
  garage?: string;
  item?: string;
  listingId?: string;
  request?: string;
}): Promise<OgShareContext> {
  const garage = input.garage?.trim() || "";
  const item = input.item?.trim() || "";
  const listingId = input.listingId?.trim() || item || "";
  const requestId = input.request?.trim() || "";

  const appQuery = new URLSearchParams();
  appQuery.set("skipSplash", "1");

  if (requestId) {
    appQuery.set("request", requestId);
    const row = await fetchRequest(requestId);
    const copy = buildRequestShareCopy({
      subcategory: row?.subcategory,
      category: row?.category,
      description: row?.description,
      locationLabel: row?.location_label,
      startDate: row?.start_date,
      endDate: row?.end_date,
    });
    const title = escapeParam(copy.ogTitle);
    const description = escapeParam(copy.ogDescription);
    const priceLabel = escapeParam(copy.budgetLabel);
    return {
      title,
      description,
      badge: "Neighbor need",
      priceLabel,
      imageParams: {
        layout: "request",
        title,
        subtitle: escapeParam(copy.metaLine || description),
        badge: "Neighbor need",
        timing: escapeParam(copy.timing),
        price: priceLabel,
        cta: "Got one? Help a neighbor",
      },
      appQuery,
    };
  }

  if (garage) {
    appQuery.set("garage", garage);
    if (item) appQuery.set("item", item);
  } else if (listingId) {
    appQuery.set("listingId", listingId);
  }

  if (listingId) {
    const listing = await fetchListing(listingId);
    if (listing) {
      const hostId = listing.owner_id || garage;
      const hostName = (hostId ? await fetchProfileName(hostId) : null) || garageFallbackName(hostId);
      const title = escapeParam(listing.title || "Sale item");
      const salePrice = readSalePrice(listing.pricing);
      const dailyRate = readDailyRate(listing.pricing);
      const isSell = Array.isArray(listing.modes) && listing.modes.includes("sell");

      if (isSell && hostId && !garage) {
        appQuery.set("garage", hostId);
        appQuery.set("item", listing.id);
      }

      const priceLabel = salePrice ? `$${salePrice}` : dailyRate ? `$${dailyRate}/day` : "";
      const description = isSell
        ? `Buy or make an offer from ${hostName}'s garage shelf.`
        : `Rent from a neighbor on ${APP_NAME}.`;
      const photo = listingCoverPhotoUrl(listing.photos);

      return {
        title: isSell ? title : `${title} — rent nearby`,
        description,
        badge: isSell ? "Garage sale" : "Rent nearby",
        priceLabel,
        imageParams: {
          title,
          subtitle: description,
          price: priceLabel,
          badge: isSell ? "Garage sale" : "Rent nearby",
          ...(photo ? { photo } : {}),
        },
        appQuery,
      };
    }
  }

  if (garage) {
    const hostName =
      (await fetchProfileName(garage)) || garageFallbackName(garage);
    const [shelfCount, photo] = await Promise.all([
      countActiveShelfItems(garage),
      fetchGarageCoverPhoto(garage),
    ]);
    const title = `${hostName} — garage open`;
    const description =
      shelfCount > 0
        ? `${shelfCount} item${shelfCount === 1 ? "" : "s"} on the shelf. Tap to browse, buy, or offer.`
        : "Tap to browse the open garage shelf — buy now or make an offer.";
    const cardSubtitle =
      shelfCount > 0
        ? `${shelfCount} item${shelfCount === 1 ? "" : "s"} on the shelf · browse, buy, or offer`
        : "Browse the shelf · buy now or make an offer";

    return {
      title,
      description,
      badge: "Open garage",
      priceLabel: "",
      imageParams: {
        title: `${hostName}'s garage`,
        subtitle: cardSubtitle,
        badge: "Open garage",
        ...(photo ? { photo } : {}),
      },
      appQuery,
    };
  }

  const title = `Garage sale on ${APP_NAME}`;
  const description = "Browse open garages near you — buy, offer, or pick up.";
  return {
    title,
    description,
    badge: APP_NAME,
    priceLabel: "",
    imageParams: {
      title,
      subtitle: description,
      badge: APP_NAME,
    },
    appQuery,
  };
}

export function buildOgImageUrl(origin: string, params: Record<string, string>): string {
  const url = new URL("/api/og/image", origin);
  for (const [key, value] of Object.entries(params)) {
    if (value.trim()) url.searchParams.set(key, value.trim());
  }
  return url.toString();
}

export function buildAppDeepLink(origin: string, appQuery: URLSearchParams): string {
  const url = new URL("/", origin);
  url.search = appQuery.toString();
  return url.toString();
}

export function buildShareLink(origin: string, appQuery: URLSearchParams): string {
  const requestId = appQuery.get("request")?.trim() || "";
  if (requestId) {
    const url = new URL(`/r/${encodeURIComponent(requestId)}`, origin);
    url.search = "";
    url.hash = "";
    return url.toString();
  }
  // Prefer short paths for crawlers + chat previews (less spammy than long query strings).
  const itemId = (appQuery.get("item") || appQuery.get("listingId") || "").trim();
  if (itemId) {
    const url = new URL(`/item/${encodeURIComponent(itemId)}`, origin);
    url.search = "";
    url.hash = "";
    return url.toString();
  }
  const garageId = appQuery.get("garage")?.trim() || "";
  if (garageId) {
    const url = new URL(`/g/${encodeURIComponent(garageId)}`, origin);
    url.search = "";
    url.hash = "";
    return url.toString();
  }
  const url = new URL("/link", origin);
  url.search = appQuery.toString();
  return url.toString();
}
