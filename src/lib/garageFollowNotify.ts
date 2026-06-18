import { pushInAppNotification } from "./inAppNotifications";
import { loadGarageFollows } from "./garageFollowStorage";
import { shouldDeliverNotification } from "./notificationPreferences";

/** Demo-local fan-out when a host publishes — server push ships with Supabase trigger. */
export function notifyGarageFollowersOfNewListing(params: {
  hostId: string;
  hostName: string;
  listingTitle: string;
}): void {
  const follows = loadGarageFollows().filter(
    (f) => f.hostId === params.hostId && f.notifyNewListings,
  );
  if (follows.length === 0) return;
  if (!shouldDeliverNotification("new_garage")) return;

  for (const follow of follows) {
    pushInAppNotification({
      type: "general",
      title: `New on ${params.hostName}'s garage`,
      body: `${params.listingTitle} just went live — tap Browse to see it.`,
    });
  }
}

export function notifyGarageFollowersOfOpenHouse(params: {
  hostId: string;
  hostName: string;
  whenLabel: string;
}): void {
  const follows = loadGarageFollows().filter(
    (f) => f.hostId === params.hostId && f.notifyOpenHouse,
  );
  if (follows.length === 0) return;
  if (!shouldDeliverNotification("open_house")) return;

  for (const _follow of follows) {
    pushInAppNotification({
      type: "general",
      title: `Open garage day — ${params.hostName}`,
      body: `${params.whenLabel}. Stop by their Evorios showcase.`,
    });
  }
}
