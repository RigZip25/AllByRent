const PREFS_KEY = "allbyrent_notification_prefs";

export type NotificationPreferences = {
  /** Master push toggle (also mirrored on profile when saved). */
  pushEnabled: boolean;
  bookings: boolean;
  messages: boolean;
  /** New garages / shelves opened near the user's block. */
  newGaragesNearby: boolean;
  /** Open garage day / yard-sale style events from followed hosts. */
  openHouseEvents: boolean;
  /** Updates on listings the user saved or rented. */
  listingUpdates: boolean;
  /** Proactive tips from Mr. Evorios (share prompts, next steps). */
  agentTips: boolean;
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  pushEnabled: true,
  bookings: true,
  messages: true,
  newGaragesNearby: true,
  openHouseEvents: true,
  listingUpdates: true,
  agentTips: true,
};

export function loadNotificationPreferences(): NotificationPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { ...DEFAULT_NOTIFICATION_PREFERENCES };
    const parsed = JSON.parse(raw) as Partial<NotificationPreferences>;
    return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...parsed };
  } catch {
    return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  }
}

export function saveNotificationPreferences(prefs: NotificationPreferences): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

export function patchNotificationPreferences(
  patch: Partial<NotificationPreferences>,
): NotificationPreferences {
  const next = { ...loadNotificationPreferences(), ...patch };
  saveNotificationPreferences(next);
  return next;
}

/** Used server-side / when creating notifications — respects user prefs. */
export function shouldDeliverNotification(
  type: "booking" | "message" | "new_garage" | "open_house" | "listing_update" | "agent_tip",
  prefs: NotificationPreferences = loadNotificationPreferences(),
): boolean {
  if (!prefs.pushEnabled) return false;
  switch (type) {
    case "booking":
      return prefs.bookings;
    case "message":
      return prefs.messages;
    case "new_garage":
      return prefs.newGaragesNearby;
    case "open_house":
      return prefs.openHouseEvents;
    case "listing_update":
      return prefs.listingUpdates;
    case "agent_tip":
      return prefs.agentTips;
    default:
      return true;
  }
}
