import { canonicalShelf, categoryQueryNames } from "../screens/listing/listingItemCategories";
import { loadBlockedUserIds } from "./moderation/blockStorage";
import { createNotificationRemote } from "./notificationsStorage";
import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";
import type { WantedRequest } from "./requestsStorage";

/**
 * Telling the neighborhood that somebody is looking for something.
 *
 * The copy has always promised "neighbors with this item get notified"; until
 * now nothing was sent. A neighbor here is a host with an active listing on the
 * same shelf in the same city — the person who can actually answer the ask.
 */

/** Enough to reach the shelf, small enough that one ask cannot spam a city. */
const MAX_RECIPIENTS = 25;

function requestDeepLink(requestId: string): string {
  return `/?request=${encodeURIComponent(requestId)}&skipSplash=1`;
}

function listingDeepLink(listingId: string): string {
  return `/?listingId=${encodeURIComponent(listingId)}&skipSplash=1`;
}

/** Hosts with an active listing on this shelf, minus the person asking. */
async function shelfHostIds(request: WantedRequest): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const city = request.locationLabel.trim();
  let query = supabase
    .from("listings")
    .select("owner_id, category, subcategory")
    .eq("listing_status", "active")
    // Listings posted before a category was renamed still sit on this shelf.
    .in("category", categoryQueryNames(request.category))
    .limit(200);
  if (city) query = query.ilike("city", `%${city}%`);

  const { data, error } = await query;
  if (error || !data) return [];

  const wanted = canonicalShelf(request.category, request.subcategory);
  const blocked = new Set(loadBlockedUserIds());
  const owners = new Set<string>();
  for (const row of data as { owner_id: string; category: string; subcategory: string }[]) {
    const shelf = canonicalShelf(row.category, row.subcategory);
    if (shelf.category !== wanted.category || shelf.subcategory !== wanted.subcategory) continue;
    const owner = row.owner_id?.trim();
    if (!owner || owner === request.renterId || blocked.has(owner)) continue;
    owners.add(owner);
    if (owners.size >= MAX_RECIPIENTS) break;
  }
  return [...owners];
}

/** Notify hosts who already stock this shelf. Returns how many were reached. */
export async function notifyNeighborsOfRequest(params: {
  request: WantedRequest;
  title: string;
  body: string;
}): Promise<number> {
  const recipients = await shelfHostIds(params.request);
  if (recipients.length === 0) return 0;

  await Promise.all(
    recipients.map((recipientId) =>
      createNotificationRemote({
        recipientId,
        actorId: params.request.renterId,
        type: "general",
        title: params.title,
        body: params.body,
        url: requestDeepLink(params.request.id),
        // The renter is the one posting; they do not need their own toast.
        skipLocal: true,
      }),
    ),
  );
  return recipients.length;
}

/**
 * Tell the renter that a neighbor listed what they asked for.
 *
 * The host cannot close somebody else's ask — RLS keeps the lifecycle with the
 * author — so this hands them the listing and lets them mark it fulfilled.
 */
export async function notifyRequestAuthorOfListing(params: {
  request: WantedRequest;
  listingId: string;
  actorId: string | null;
  title: string;
  body: string;
}): Promise<void> {
  const recipientId = params.request.renterId.trim();
  if (!recipientId || recipientId === params.actorId) return;

  await createNotificationRemote({
    recipientId,
    actorId: params.actorId,
    type: "general",
    title: params.title,
    body: params.body,
    listingId: params.listingId,
    url: listingDeepLink(params.listingId),
    skipLocal: true,
  });
}
