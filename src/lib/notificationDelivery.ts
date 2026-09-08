import { shouldDeliverNotification, type NotificationPreferences } from "./notificationPreferences";

export type InAppNotificationKind =
  | "booking_request"
  | "running_late"
  | "return"
  | "general"
  | "message"
  | "new_garage"
  | "open_house"
  | "listing_update"
  | "agent_tip";

/** Map in-app / remote notification kinds onto preference toggles. */
export function preferenceTypeForNotification(
  type: InAppNotificationKind | string,
): Parameters<typeof shouldDeliverNotification>[0] {
  switch (type) {
    case "booking_request":
    case "running_late":
    case "return":
      return "booking";
    case "message":
      return "message";
    case "new_garage":
      return "new_garage";
    case "open_house":
      return "open_house";
    case "listing_update":
      return "listing_update";
    case "agent_tip":
      return "agent_tip";
    case "general":
    default:
      // Garage auction / cart alerts fall under listing updates when no tighter type is set.
      return "listing_update";
  }
}

export function mayDeliverNotification(
  type: InAppNotificationKind | string,
  prefs?: NotificationPreferences,
): boolean {
  return shouldDeliverNotification(preferenceTypeForNotification(type), prefs);
}
